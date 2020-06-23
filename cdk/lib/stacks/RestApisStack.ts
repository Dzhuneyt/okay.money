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
import {Stats} from '../constructs/rest/Stats';
import {getLambdaTypescriptProps} from '../constructs/rest/util/getLambdaCode';
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
    private authorizer: TokenAuthorizer;
    private props: Props;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.props = props;

        this.createApiGateway();
        this.createApigatewayEndpoints();

        this.createUserManagementAPIs();

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
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


    private createAuthorizerLambda() {
        const authFn = new LambdaTypescript(this, 'fn-authorizer', {
            ...getLambdaTypescriptProps('authorizer.ts'),
        });
        authFn.addToRolePolicy(new PolicyStatement({
            resources: [this.props.userPool.userPoolArn],
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
        this.createAuthorizerLambda();

        new CfnUserPoolResourceServer(this, 'cognit-resource-server', {
            identifier: 'https://my-weather-api.example.com',
            name: 'RestAPIsResourceServer',
            userPoolId: this.props.userPool.userPoolId,
            scopes: [
                {
                    scopeName: 'default',
                    scopeDescription: "Default scope",
                }
            ]
        });

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
        new GatewayResponseMapper(this, 'gateway-responses', {
            api: this.api,
        });
    }

    private createApigatewayEndpoints() {
        new Login(this, 'login', {
            api: this.api,
            userPool: this.props.userPool,
        });
        new Register(this, 'register', {
            api: this.api,
            userPool: this.props.userPool,
        });
        new Account(this, 'account', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Category(this, 'category', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Transaction(this, 'transaction', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Stats(this, 'stats', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
    }
}
