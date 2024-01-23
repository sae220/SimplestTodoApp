import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC・サブネット・セキュリティグループの作成

    // RDSの作成

    // ECRの作成・Dockerイメージをプッシュ

    // App Runner作成・独自ドメインの設定
  }
}
