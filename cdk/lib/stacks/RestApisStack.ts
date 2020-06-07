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
import {Lambda} from '../constructs/Lambda';
import {Account} from '../constructs/rest/Account';
import {Category} from '../constructs/rest/Category';
import {GatewayResponseMapper} from '../constructs/rest/GatewayResponseMapper';
import {Login} from '../constructs/rest/Login';
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
    return Code.fromAsset(path.resolve(__dirname, '../../dist/lambdas/', lambdaName))
}

export class RestApisStack extends cdk.Stack {
    private api: RestApi;
    private readonly userPool: UserPool;
    private cognitoResourceServer: CfnUserPoolResourceServer;
    private authorizer: TokenAuthorizer;
    private props: Props;
    private logGroup: LogGroup;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.props = props;
        this.userPool = props.userPool;

        this.createLogGroup();
        this.createCognitoResourceServerForRestAPIs();
        this.createAuthorizerLambda();
        this.createBaseApi();
        this.overwriteResponseTemplates();

        this.createLoginAPI();
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

    private createLogGroup() {
        this.logGroup = new LogGroup(this, 'api-logs', {
            removalPolicy: RemovalPolicy.DESTROY,
            // @TODO increase retention
            retention: RetentionDays.ONE_DAY,
        });
    }

    private createAuthorizerLambda() {
        const authFn = new Lambda(this, 'fn-authorizer', {
            code: getLambdaCode("authorizer"),
            handler: 'index.handler',
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

    private createBaseApi() {
        this.api = new RestApi(this, this.stackName, {
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(this.logGroup),
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
}
