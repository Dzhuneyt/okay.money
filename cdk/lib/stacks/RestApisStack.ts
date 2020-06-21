import {
    AccessLogFormat,
    AuthorizationType, GatewayResponse,
    LogGroupLogDestination, ResponseType,
    RestApi,
    TokenAuthorizer
} from '@aws-cdk/aws-apigateway';
import {CfnUserPoolResourceServer, UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Code} from '@aws-cdk/aws-lambda';
import {LogGroup, RetentionDays} from '@aws-cdk/aws-logs';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, RemovalPolicy, StackProps} from '@aws-cdk/core';
import * as fs from 'fs';
import * as path from 'path';
import {LambdaTypescript} from '../constructs/LambdaTypescript';
import {Account} from '../constructs/rest/Account';
import {Category} from '../constructs/rest/Category';
import {GatewayResponseMapper} from '../constructs/rest/GatewayResponseMapper';
import {getLambdaTypescriptProps} from '../constructs/rest/getLambdaCode';
import {Login} from '../constructs/rest/Login';
import {Register} from '../constructs/rest/Register';
import {Transaction} from '../constructs/rest/Transaction';

interface Props extends StackProps {
    userPool: UserPool;
    dynamoTables: {
        account: Table,
        category: Table,
        transaction: Table,
    };
}

function getLambdaCode(lambdaName: string) {
    const filePath = path.resolve(__dirname, '../../dist/lambdas/', lambdaName);
    try {
        if (fs.existsSync(filePath)) {
            return Code.fromAsset(filePath)
        }
    } catch (err) {
        console.error(err)
    }
    throw new Error(`File does not exist at ${filePath}`);

}

export class RestApisStack extends cdk.Stack {
    private api: RestApi;
    private readonly userPool: UserPool;
    private cognitoResourceServer: CfnUserPoolResourceServer;
    private authorizer: TokenAuthorizer;
    private props: Props;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.props = props;
        this.userPool = props.userPool;

        this.createCognitoResourceServerForRestAPIs();
        this.createAuthorizerLambda();
        this.createApiGateway();
        this.overwriteResponseTemplates();

        this.createLoginAPI();
        this.createRegisterAPI();
        this.createAccountAPIs();
        this.createCategoryAPIs();
        this.createUserManagementAPIs();
        this.createTransactionAPIs();

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
    }

    private createAccountAPIs() {
        new Account(this, 'account', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
    }

    private createCategoryAPIs() {
        new Category(this, 'category', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
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
        new Transaction(this, 'transaction', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        })

    }

    private createLoginAPI() {
        new Login(this, 'login', {
            api: this.api,
            userPool: this.userPool,
        });
    }

    private createCognitoResourceServerForRestAPIs() {
        this.cognitoResourceServer = new CfnUserPoolResourceServer(this, 'cognit-resource-server', {
            identifier: 'https://my-weather-api.example.com',
            name: 'RestAPIsResourceServer',
            userPoolId: this.userPool.userPoolId,
            scopes: [
                {
                    scopeName: 'default',
                    scopeDescription: "Default scope",
                }
            ]
        });
    }

    private createAuthorizerLambda() {
        const authFn = new LambdaTypescript(this, 'fn-authorizer', {
            ...getLambdaTypescriptProps('authorizer.ts'),
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
    }

    private createApiGateway() {
        const logGroup = new LogGroup(this, 'api-logs', {
            removalPolicy: RemovalPolicy.DESTROY,
            // @TODO increase retention
            retention: RetentionDays.ONE_DAY,
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
    }

    private overwriteResponseTemplates() {
        new GatewayResponseMapper(this, 'gateway-responses', {
            api: this.api,
        });
    }

    private createRegisterAPI() {
        new Register(this, 'register', {
            api: this.api,
            userPool: this.userPool,
        });
    }
}
