import {LambdaIntegration, RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Code} from '@aws-cdk/aws-lambda';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, RemovalPolicy, StackProps} from '@aws-cdk/core';
import * as path from 'path';
import {Lambda} from './constructs/Lambda';

interface Props extends StackProps {
    userPool: UserPool;
}

export class RestApisStack extends cdk.Stack {
    private api: RestApi;

    private lambdaCode = Code.fromAsset(path.resolve(__dirname, '../dist/lambdas/'));
    private userPool: UserPool;

    private dynamoTables: {
        account: Table,
        category: Table,
        transaction: Table,
    };

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.api = new RestApi(this, this.stackName, {});
        this.api.root.addMethod('ANY');

        this.userPool = props.userPool;

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
        this.createDynamoDBtables();

        this.createLoginAPI();
        this.createAccountAPIs();
        this.createCategoryAPIs();
        this.createUserManagementAPIs();
        this.createTransactionAPIs();
    }

    private createAccountAPIs() {
        const accounts = this.api.root.addResource('account');

        const fnAccountList = new Lambda(this, 'fn-account-list', {
            code: this.lambdaCode,
            handler: 'account-list.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
            }
        });
        this.dynamoTables.account.grantReadData(fnAccountList);
        accounts.addMethod('GET', new LambdaIntegration(fnAccountList));
        accounts.addMethod('POST');

        const account = accounts.addResource('{id}');
        account.addMethod('GET');
        account.addMethod('DELETE');
    }

    private createCategoryAPIs() {
        const categories = this.api.root.addResource('category');
        categories.addMethod('GET');
        categories.addMethod('POST');

        const category = categories.addResource('{id}');
        category.addMethod('GET');
        category.addMethod('DELETE');

    }

    private createUserManagementAPIs() {
        const users = this.api.root.addResource('user');
        users.addMethod('GET');
        users.addMethod('POST');

        const user = users.addResource('{id}');
        user.addMethod('GET');
        user.addMethod('DELETE');
    }

    private createTransactionAPIs() {
        const transactions = this.api.root.addResource('transaction');
        transactions.addMethod('GET');
        transactions.addMethod('POST');

        const transaction = transactions.addResource('{id}');
        transaction.addMethod('GET');
        transaction.addMethod('DELETE');
    }

    private createDynamoDBtables() {
        const removalPolicy = RemovalPolicy.DESTROY;
        this.dynamoTables = {
            account: new Table(this, 'account', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "pk",
                    type: AttributeType.STRING,
                },
                sortKey: {
                    name: "sk",
                    type: AttributeType.STRING,
                },
                removalPolicy,
            }),
            category: new Table(this, 'category', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "pk",
                    type: AttributeType.STRING,
                },
                sortKey: {
                    name: "sk",
                    type: AttributeType.STRING,
                },
                removalPolicy,
            }),
            transaction: new Table(this, 'transaction', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "pk",
                    type: AttributeType.STRING,
                },
                sortKey: {
                    name: "sk",
                    type: AttributeType.STRING,
                },
                removalPolicy,
            })
        };
    }

    private createLoginAPI() {
        const fnLogin = new Lambda(this, 'fn-login', {
            code: this.lambdaCode,
            handler: 'login.handler',
            timeout: Duration.seconds(30),
        });
        fnLogin.addEnvironment('COGNITO_USERPOOL_ID', this.userPool.userPoolId);
        fnLogin.addEnvironment('COGNITO_USERPOOL_CLIENT_ID', this.userPool.addClient('login', {
            authFlows: {
                userPassword: true,
                refreshToken: true,
            }
        }).userPoolClientId);
        fnLogin.addToRolePolicy(new PolicyStatement({
            resources: [this.userPool.userPoolArn],
            actions: [
                "cognito-idp:InitiateAuth",
            ]
        }));

        const login = this.api.root.addResource('login');
        login.addMethod('POST', new LambdaIntegration(fnLogin));
    }
}
