import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as rds from 'aws-cdk-lib/aws-rds'
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager'
import * as apprunner from '@aws-cdk/aws-apprunner-alpha'
import * as image_deploy from 'cdk-docker-image-deployment'

const PROJECT_NAME = 'simplestTodoApp'
const POSTGRES_USER = 'testuser'
const POSTGRES_DB = 'testdb'

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props)

    // VPC・サブネット・セキュリティグループの作成
    const vpc = new ec2.Vpc(this, `${PROJECT_NAME}-vpc`, {
      maxAzs: 2
    })
    const securityGroupForAppRunner = new ec2.SecurityGroup(this, `${PROJECT_NAME}-sg-forApprunner`, {
      vpc
    })
    const securityGroupForRDS = new ec2.SecurityGroup(this, `${PROJECT_NAME}-sg-forRds`, {
      vpc
    })
    securityGroupForRDS.addIngressRule(securityGroupForAppRunner, ec2.Port.tcp(5432))

    // RDSの作成
    new rds.DatabaseInstance(this, `${PROJECT_NAME}-rds`, {
      engine: rds.DatabaseInstanceEngine.POSTGRES,
      vpc,
      credentials: rds.Credentials.fromGeneratedSecret(POSTGRES_USER, {
        secretName: `${PROJECT_NAME}-db-password`
      }),
      databaseName: POSTGRES_DB,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MEDIUM),
      securityGroups: [securityGroupForRDS]
    })

    // ECRの作成・Dockerイメージをプッシュ
    const ecrRepository = new ecr.Repository(this, `${PROJECT_NAME}-ecr`)
    new image_deploy.DockerImageDeployment(this, `${PROJECT_NAME}-imagedeploy`, {
      source: image_deploy.Source.directory('../app'),
      destination: image_deploy.Destination.ecr(ecrRepository)
    })

    // App Runner作成・独自ドメインの設定
    const vpcConnector = new apprunner.VpcConnector(this, `${PROJECT_NAME}-vpcconnector`, {
      vpc,
      securityGroups: [securityGroupForAppRunner]
    })
    new apprunner.Service(this, `${PROJECT_NAME}-apprunner`, {
      source: apprunner.Source.fromEcr({
        repository: ecrRepository,
        imageConfiguration: {
          environmentVariables: {
            POSTGRES_USER,
            POSTGRES_DB
          },
          environmentSecrets: {
            POSTGRES_PASSWORD: apprunner.Secret.fromSecretsManager(secretsmanager.Secret.fromSecretNameV2(this, `${PROJECT_NAME}-db-password`, `${PROJECT_NAME}-db-password`))
          },
          port: 8000
        }
      }),
      vpcConnector
    })
  }
}
