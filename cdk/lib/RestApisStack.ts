import {
    AccessLogFormat,
    AuthorizationType, GatewayResponse,
    LogGroupLogDestination, ResponseType,
    RestApi,
    TokenAuthorizer
} from '@aws-cdk/aws-apigateway';
import {CfnUserPoolResourceServer, UserPool} from '@aws-cdk/aws-cognito';
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Code} from '@aws-cdk/aws-lambda';
import {LogGroup, RetentionDays} from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, RemovalPolicy, StackProps} from '@aws-cdk/core';
import * as path from 'path';
import {Lambda} from './constructs/Lambda';
import {LambdaIntegration} from './constructs/LambdaIntegration';

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

    // private readonly cognitoAuthorizer: CfnAuthorizer;
    private authorizer: TokenAuthorizer;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.userPool = props.userPool;

        this.createCognitoResourceServerForRestAPIs();

        const logGroup = new LogGroup(this, 'api-logs', {
            removalPolicy: RemovalPolicy.DESTROY,
            retention: RetentionDays.ONE_DAY,
        });
        const authFn = new Lambda(this, 'fn-authorizer', {
            code: getLambdaCode("authorizer"),
            handler: 'index.handler',
            environment: {}
        });
        authFn.addToRolePolicy(new PolicyStatement({
            resources: [this.userPool.userPoolArn],
            actions: [
                "cognito-idp:GetUser",
            ]
        }));
        this.authorizer = new TokenAuthorizer(this, 'api-authorizer', {
            handler: authFn,
            resultsCacheTtl: Duration.seconds(0),
        });
        this.api = new RestApi(this, this.stackName, {
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(logGroup),
                accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
                tracingEnabled: true,
            },
            defaultCorsPreflightOptions: {
                allowHeaders: ["*"],
                allowMethods: ["*"],
                allowOrigins: ["*"],
                allowCredentials: true,
                disableCache: true,
            },
            defaultMethodOptions: {
                // By default all requests do not require authentication
                authorizer: {
                    authorizerId: "",
                    authorizationType: AuthorizationType.NONE,
                },
            },
        });

        [
            ResponseType.DEFAULT_4XX,
            ResponseType.DEFAULT_5XX,
            ResponseType.UNAUTHORIZED,
            ResponseType.ACCESS_DENIED,
            ResponseType.API_CONFIGURATION_ERROR,
            ResponseType.AUTHORIZER_FAILURE,
            ResponseType.AUTHORIZER_CONFIGURATION_ERROR,
            ResponseType.MISSING_AUTHENTICATION_TOKEN,
            ResponseType.BAD_REQUEST_BODY,
            ResponseType.BAD_REQUEST_PARAMETERS,
            ResponseType.EXPIRED_TOKEN,
            ResponseType.INTEGRATION_FAILURE,
            ResponseType.INTEGRATION_TIMEOUT,
            ResponseType.INVALID_SIGNATURE,
            ResponseType.INVALID_API_KEY,
            ResponseType.RESOURCE_NOT_FOUND,
            ResponseType.THROTTLED,
            ResponseType.UNSUPPORTED_MEDIA_TYPE,
        ].forEach(type => {
            // Reformat errors from API gateway into a more friendly and less revealing
            // response body. Also attach CORS headers so that the frontend can read the actual
            // status code and body and react. Otherwise, the browser rejects the request
            // and prevents the frontend from reacting properly. For example, on expired
            // authorization token, the frontend can not detect this error and redirect
            // to the /login page
            const gatewayResponse = new GatewayResponse(this, 'gw-response-' + type.responseType, {
                restApi: this.api,
                type,
                responseHeaders: {
                    "Access-Control-Allow-Origin": "'*'",
                    "Access-Control-Allow-Headers": "'*'"
                },
                templates: {
                    "application/json": "{\n     \"message\": $context.error.messageString,\n     \"type\":  \"$context.error.responseType\",\n     \"resourcePath\":  \"$context.resourcePath\",\n }"
                }
            });
            gatewayResponse.node.addDependency(this.api);
        })

        // this.api.root.addMethod('ANY', new MockIntegration({}), {
        //     authorizationType: AuthorizationType.NONE,
        // });

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
        const accounts = this.api.root.addResource('account', {});
        const account = accounts.addResource('{id}', {});

        const fnAccountList = new Lambda(this, 'fn-account-list', {
            code: getLambdaCode("account-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
                TABLE_NAME_TRANSACTIONS: this.dynamoTables.transaction.tableName,
            }
        });
        this.dynamoTables.account.grantReadData(fnAccountList);
        accounts.addMethod('GET', new LambdaIntegration(fnAccountList, {}), {
            authorizer: this.authorizer,
        });

        const fnAccountCreate = new Lambda(this, 'fn-account-create', {
            code: getLambdaCode("account-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
            }
        });
        this.dynamoTables.account.grantReadWriteData(fnAccountCreate);
        accounts.addMethod('POST', new LambdaIntegration(fnAccountCreate), {
            authorizer: this.authorizer,
        });

        const fnView = new Lambda(this, 'fn-account-view', {
            code: getLambdaCode("account-view"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
            }
        });
        account
            .addMethod('GET', new LambdaIntegration(fnView), {
                authorizer: this.authorizer,
            });

        const fnEdit = new Lambda(this, 'fn-account-edit', {
            code: getLambdaCode("account-edit"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.account.tableName,
            }
        });
        account
            .addMethod('PUT', new LambdaIntegration(fnEdit), {
                authorizer: this.authorizer,
            });

        // @TODO account delete APIs
    }

    private createCategoryAPIs() {
        const categories = this.api.root.addResource('category', {});

        // Category listing
        const fnCategoryList = new Lambda(this, 'fn-category-list', {
            code: getLambdaCode("category-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.category.tableName,
            },
        });
        categories.addMethod('GET', new LambdaIntegration(fnCategoryList), {
            authorizer: this.authorizer,
        });

        // Category creation
        const fnCategoryCreate = new Lambda(this, 'fn-category-create', {
            code: getLambdaCode("category-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.category.tableName,
            },
        });
        categories.addMethod('POST', new LambdaIntegration(fnCategoryCreate), {
            authorizer: this.authorizer,
        })

    }

    private createUserManagementAPIs() {
        // const users = this.api.root.addResource('user');
        // users.addMethod('GET');
        // users.addMethod('POST');
        //
        // const user = users.addResource('{id}');
        // user.addMethod('GET');
        // user.addMethod('DELETE');
    }

    private createTransactionAPIs() {
        const fnTransactionCreate = new Lambda(this, 'fn-transaction-create', {
            code: getLambdaCode("transaction-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.transaction.tableName,
                TABLE_NAME_ACCOUNTS: this.dynamoTables.account.tableName,
                TABLE_NAME_CATEGORIES: this.dynamoTables.category.tableName,
            },
        });

        const transactions = this.api.root.addResource('transaction', {});
        const transaction = transactions.addResource('{id}');
        transactions.addMethod('POST', new LambdaIntegration(fnTransactionCreate), {
            authorizer: this.authorizer,
        })

        const fnTransactionList = new Lambda(this, 'fn-transaction-list', {
            code: getLambdaCode("transaction-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: this.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: this.dynamoTables.account.tableName,
            },
        });
        transactions.addMethod('GET', new LambdaIntegration(fnTransactionList), {
            authorizer: this.authorizer,
        });

        // Transaction view
        const fnView = new Lambda(this, 'fn-transaction-view', {
            code: getLambdaCode("transaction-view"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: this.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: this.dynamoTables.account.tableName,
            },
        });
        transaction
            .addMethod('GET', new LambdaIntegration(fnView), {
                authorizer: this.authorizer,
            });

        // Transaction edit
        const fnEdit = new Lambda(this, 'fn-transaction-edit', {
            code: getLambdaCode("transaction-edit"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: this.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: this.dynamoTables.account.tableName,
            },
        });
        transaction
            .addMethod('PUT', new LambdaIntegration(fnEdit), {
                authorizer: this.authorizer,
            });

        // Transaction delete
        const fnDelete = new Lambda(this, 'fn-transaction-delete', {
            code: getLambdaCode("transaction-delete"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: this.dynamoTables.transaction.tableName,
            },
        });
        transaction
            .addMethod('DELETE', new LambdaIntegration(fnDelete), {
                authorizer: this.authorizer,
            });

    }

    private createDynamoDBtables() {
        const removalPolicy = RemovalPolicy.DESTROY;
        this.dynamoTables = {
            account: new Table(this, 'account', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "id",
                    type: AttributeType.STRING,
                },
                removalPolicy,
            }),
            category: new Table(this, 'category', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "id",
                    type: AttributeType.STRING,
                },
                removalPolicy,
            }),
            transaction: new Table(this, 'transaction', {
                billingMode: BillingMode.PAY_PER_REQUEST,
                partitionKey: {
                    name: "id",
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

        // Allow the Lambda to do username/password login to Cognito and get Access Token
        const userPoolClientId = this.userPool.addClient('login', {
            authFlows: {
                userPassword: true,
                refreshToken: true,
            },
        }).userPoolClientId;
        fnLogin.addEnvironment('COGNITO_USERPOOL_CLIENT_ID', userPoolClientId);
        fnLogin.addToRolePolicy(new PolicyStatement({
            resources: [this.userPool.userPoolArn],
            actions: [
                "cognito-idp:InitiateAuth",
            ]
        }));

        const login = this.api.root.addResource('login');

        login.addMethod('POST', new LambdaIntegration(fnLogin), {
            // methodResponses: [
            //     {
            //         statusCode: "200",
            //         responseModels: {}
            //     }
            // ]
        });
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
