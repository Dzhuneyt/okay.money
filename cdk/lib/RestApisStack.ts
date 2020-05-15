import {
    AccessLogFormat,
    AuthorizationType,
    CfnAuthorizer,
    LambdaIntegration,
    LogGroupLogDestination,
    RestApi
} from '@aws-cdk/aws-apigateway';
import {CfnUserPoolResourceServer, UserPool} from '@aws-cdk/aws-cognito';
import {AttributeType, BillingMode, ProjectionType, Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Code} from '@aws-cdk/aws-lambda';
import {LogGroup, RetentionDays} from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, RemovalPolicy, StackProps} from '@aws-cdk/core';
import * as path from 'path';
import {Lambda} from './constructs/Lambda';

interface Props extends StackProps {
    userPool: UserPool;
}

function getLambdaCode(lambdaName: string) {
    return Code.fromAsset(path.resolve(__dirname, '../dist/lambdas/', lambdaName))
}

export class RestApisStack extends cdk.Stack {
    private api: RestApi;

    private userPool: UserPool;

    private dynamoTables: {
        account: Table,
        category: Table,
        transaction: Table,
    };
    private cognitoResourceServer: CfnUserPoolResourceServer;

    private readonly defaultCognitoScope = "default";
    private readonly cognitoAuthorizer: CfnAuthorizer;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.userPool = props.userPool;

        this.createCognitoResourceServerForRestAPIs();

        const logGroup = new LogGroup(this, 'api-logs', {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.FOUR_MONTHS,
        });
        this.api = new RestApi(this, this.stackName, {
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(logGroup),
                accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
                tracingEnabled: true,
            }
        });
        this.cognitoAuthorizer = new CfnAuthorizer(this, 'authorizer', {
            name: `default-authorizer`,
            identitySource: 'method.request.header.Authorization',
            restApiId: this.api.restApiId,
            type: AuthorizationType.COGNITO,
            providerArns: [this.userPool.userPoolArn],
        });

        this.api.root.addMethod('ANY');

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
        const accounts = this.api.root.addResource('account', {
            defaultMethodOptions: {
                authorizer: {
                    authorizerId: this.cognitoAuthorizer.logicalId,
                    authorizationType: AuthorizationType.COGNITO,
                }
            }
        });
        accounts.node.addDependency(this.cognitoAuthorizer);

        const fnAccountList = new Lambda(this, 'fn-account-list', {
            code: getLambdaCode("account-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
            }
        });
        this.dynamoTables.account.grantReadData(fnAccountList);
        accounts.addMethod('GET', new LambdaIntegration(fnAccountList), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.cognitoAuthorizer.ref,
            },
        });

        const fnAccountCreate = new Lambda(this, 'fn-account-create', {
            code: getLambdaCode("account-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
            }
        });
        this.dynamoTables.account.grantWriteData(fnAccountCreate);
        accounts.addMethod('POST', new LambdaIntegration(fnAccountCreate), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.cognitoAuthorizer.ref,
            },
        });

        // @TODO account view and delete APIs
    }

    private createCategoryAPIs() {
        const categories = this.api.root.addResource('category', {
            defaultMethodOptions: {
                authorizer: {
                    authorizerId: this.cognitoAuthorizer.logicalId,
                    authorizationType: AuthorizationType.COGNITO,
                }
            }
        });
        categories.node.addDependency(this.cognitoAuthorizer);

        // Category listing
        const fnCategoryList = new Lambda(this, 'fn-category-list', {
            code: getLambdaCode("category-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.category.tableName,
            },
        });
        fnCategoryList.addToRolePolicy(new PolicyStatement({
            sid: "ReadFromTableAndIndexes",
            actions: ["dynamodb:*"],
            resources: [
                this.dynamoTables.category.tableArn,
                this.dynamoTables.category.tableArn + "*",
            ]
        }))
        this.dynamoTables.category.grantReadData(fnCategoryList);
        categories.addMethod('GET', new LambdaIntegration(fnCategoryList), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.cognitoAuthorizer.ref,
            },
        });

        // Category creation
        const fnCategoryCreate = new Lambda(this, 'fn-category-create', {
            code: getLambdaCode("category-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.category.tableName,
            },
        });
        this.dynamoTables.category.grantReadWriteData(fnCategoryCreate);
        categories.addMethod('POST', new LambdaIntegration(fnCategoryCreate), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: this.cognitoAuthorizer.ref,
            },
        })

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
                removalPolicy,
            }),
            category: new Table(this, 'category', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "pk",
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
                removalPolicy,
            })
        };

        this.dynamoTables.account.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });
        this.dynamoTables.category.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });
        this.dynamoTables.transaction.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });

    }

    private createLoginAPI() {
        const fnLogin = new Lambda(this, 'fn-login', {
            code: getLambdaCode("login"),
            handler: 'index.handler',
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

    private createCognitoResourceServerForRestAPIs() {
        this.cognitoResourceServer = new CfnUserPoolResourceServer(this, 'cognit-resource-server', {
            identifier: 'https://my-weather-api.example.com',
            name: 'RestAPIsResourceServer',
            userPoolId: this.userPool.userPoolId,
            scopes: [
                {
                    scopeName: this.defaultCognitoScope,
                    scopeDescription: "Default scope",
                }
            ]
        });
    }
}
