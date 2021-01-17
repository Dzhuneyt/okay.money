import {AuthorizationType, IResource, IRestApi} from '@aws-cdk/aws-apigateway';
import {IUserPool} from '@aws-cdk/aws-cognito';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {getPropsByLambdaFilename} from '../../../../constructs/rest/util/getLambdaCode';

export class Login extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: IUserPool,
        apiRootResource: IResource,
    }) {
        super(scope, id);

        const fnLogin = new LambdaTypescript(this, 'login', {
            ...getPropsByLambdaFilename('login.ts'),
        });
        fnLogin.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);

        fnLogin.addToRolePolicy(new PolicyStatement({
            resources: [props.userPool.userPoolArn],
            actions: [
                "cognito-idp:InitiateAuth",
            ]
        }));
        fnLogin.addToRolePolicy(new PolicyStatement({
            actions: ['ssm:Get*'],
            resources: ['*'],
        }))

        props.apiRootResource
            .addResource('login')
            .addMethod('POST', new LambdaIntegration(fnLogin), {
                authorizationType: AuthorizationType.NONE,
            });

    }
}
