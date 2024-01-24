import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import * as rds from 'aws-cdk-lib/aws-rds'

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

    // App Runner作成・独自ドメインの設定
  }
}
