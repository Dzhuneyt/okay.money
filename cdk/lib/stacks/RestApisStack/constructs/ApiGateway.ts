import {AccessLogFormat, AuthorizationType, Cors, LogGroupLogDestination, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {LogGroup, RetentionDays} from 'aws-cdk-lib/aws-logs';
import {RemovalPolicy, Stack} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {GatewayResponseMapper} from './GatewayResponseMapper';
import {StringParameter} from "aws-cdk-lib/aws-ssm";

export class ApiGateway extends Construct {
    public readonly api: RestApi;

    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.api = new RestApi(this, 'Default', {
            restApiName: `${Stack.of(this).stackName}-${process.env.ENV_NAME}`,
            description: `API Gateway for Personal Finance app. Environment: ${process.env.ENV_NAME}`,
            deployOptions: {
                accessLogDestination: new LogGroupLogDestination(new LogGroup(this, 'api-logs', {
                    removalPolicy: RemovalPolicy.DESTROY,
                    // @TODO increase retention
                    retention: RetentionDays.ONE_WEEK,
                })),
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

        new StringParameter(this.api, 'StringParameter', {
            stringValue: this.api.url,
            parameterName: `/finance/${process.env.ENV_NAME}/api-url`,
        })

        new GatewayResponseMapper(this, 'gateway-responses', {
            api: this.api,
        });
    }
}
