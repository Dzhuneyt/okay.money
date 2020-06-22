import {RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../LambdaIntegration';
import {LambdaTypescript} from '../LambdaTypescript';
import {getLambdaTypescriptProps} from './util/getLambdaCode';

export class Register extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: UserPool,
        api: RestApi,
    }) {
        super(scope, id);

        const fnRegister = new LambdaTypescript(this, 'fn-register', {
            ...getLambdaTypescriptProps('register.ts'),
            initialPolicy: [
                new PolicyStatement({
                    sid: "AllowCreatingCognitoUsers",
                    resources: [props.userPool.userPoolArn],
                    actions: [
                        "cognito-idp:AdminCreateUser",
                        "cognito-idp:ListUsers",
                        "cognito-idp:AdminGetUser",
                        "cognito-idp:AdminSetUserPassword",
                    ]
                }),
            ]
        });
        fnRegister.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);

        props.api.root
            .addResource('register')
            .addMethod('POST', new LambdaIntegration(fnRegister), {});
    }
}
