import {AuthorizationType, IRestApi} from '@aws-cdk/aws-apigateway';
import {IUserPool} from '@aws-cdk/aws-cognito';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {getPropsByLambdaFilename} from '../../../../constructs/rest/util/getLambdaCode';

export class Login extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: IUserPool,
        api: IRestApi,
    }) {
        super(scope, id);

        const fnLogin = new LambdaTypescript(this, 'login', {
            ...getPropsByLambdaFilename('login.ts'),
        });
        fnLogin.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);

        // Allow the Lambda to do username/password login to Cognito and get Access Token
        const userPoolClientId = props.userPool.addClient('login', {
            authFlows: {
                userPassword: true,
                // refreshToken: true,
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
            .addMethod('POST', new LambdaIntegration(fnLogin), {
                authorizationType: AuthorizationType.NONE,
            });

    }
}
