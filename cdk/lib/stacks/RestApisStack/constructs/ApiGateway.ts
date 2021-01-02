import {AccessLogFormat, AuthorizationType, Cors, LogGroupLogDestination, RestApi} from '@aws-cdk/aws-apigateway';
import {CfnUserPoolResourceServer, IUserPool} from '@aws-cdk/aws-cognito';
import {LogGroup, RetentionDays} from '@aws-cdk/aws-logs';
import {Construct, RemovalPolicy, Stack} from '@aws-cdk/core';
import {GatewayResponseMapper} from './GatewayResponseMapper';

export class ApiGateway extends Construct {
    public readonly api: RestApi;

    constructor(scope: Construct, id: string, props: {
        userPool: IUserPool,
    }) {
        super(scope, id);

        new CfnUserPoolResourceServer(this, 'CfnUserPoolResourceServer', {
            identifier: 'https://example.com',
            name: 'CfnUserPoolResourceServer',
            userPoolId: props.userPool.userPoolId,
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

        this.api = new RestApi(this, 'Default', {
            restApiName: `${Stack.of(this).stackName}-${process.env.ENV_NAME}`,
            description: `API GW for Personal Finance app. Environment: ${process.env.ENV_NAME}`,
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(logGroup),
                accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
                tracingEnabled: true,
                throttlingRateLimit: 50, // API calls per second
                throttlingBurstLimit: 50, // parallel API calls allowed
            },
            defaultCorsPreflightOptions: {
                allowHeaders: Cors.DEFAULT_HEADERS,
                allowMethods: Cors.ALL_METHODS,
                allowOrigins: Cors.ALL_ORIGINS,
                allowCredentials: true,
                disableCache: true,
            },
            defaultMethodOptions: {
                // By default all requests DO NOT require authentication
                authorizer: {
                    authorizerId: "",
                    authorizationType: AuthorizationType.NONE,
                },
                authorizationType: AuthorizationType.NONE,
            },
        });

        new GatewayResponseMapper(this, 'gateway-responses', {
            api: this.api,
        });
    }
}
