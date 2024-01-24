import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as ec2 from 'aws-cdk-lib/aws-ec2'

const PROJECT_NAME = 'simplestTodoApp'

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

    // ECRの作成・Dockerイメージをプッシュ

    // App Runner作成・独自ドメインの設定
  }
}
