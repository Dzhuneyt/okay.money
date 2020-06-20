import {RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Construct, Duration} from '@aws-cdk/core';
import {LambdaIntegration} from '../LambdaIntegration';
import {getLambdaTypescriptCode} from './getLambdaCode';

export class Login extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: UserPool,
        api: RestApi,
    }) {
        super(scope, id);

        const fnLogin = new NodejsFunction(this, 'login', {
            ...getLambdaTypescriptCode('login.ts'),
            timeout: Duration.seconds(30),
        });
        fnLogin.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);

        // Allow the Lambda to do username/password login to Cognito and get Access Token
        const userPoolClientId = props.userPool.addClient('login', {
            authFlows: {
                userPassword: true,
                refreshToken: true,
            },
        }).userPoolClientId;
        fnLogin.addEnvironment('COGNITO_USERPOOL_CLIENT_ID', userPoolClientId);
        fnLogin.addToRolePolicy(new PolicyStatement({
            resources: [props.userPool.userPoolArn],
            actions: [
                "cognito-idp:InitiateAuth",
            ]
        }));

        props.api.root
            .addResource('login')
            .addMethod('POST', new LambdaIntegration(fnLogin), {});

    }
}
