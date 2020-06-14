import {RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Construct, Duration} from '@aws-cdk/core';
import * as path from "path";
import {LambdaIntegration} from '../LambdaIntegration';

export class Register extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: UserPool,
        api: RestApi,
    }) {
        super(scope, id);

        const fnRegister = new NodejsFunction(this, 'register', {
            entry: path.resolve(__dirname, '../../../lambdas/register.ts'),
            handler: 'handler',
            timeout: Duration.seconds(30),
        })
        fnRegister.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);

        props.api.root
            .addResource('register')
            .addMethod('POST', new LambdaIntegration(fnRegister), {});

    }
}
