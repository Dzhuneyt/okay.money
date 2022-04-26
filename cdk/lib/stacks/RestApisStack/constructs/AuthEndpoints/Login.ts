import {AuthorizationType, IResource} from 'aws-cdk-lib/aws-apigateway';
import {IUserPool} from 'aws-cdk-lib/aws-cognito';
import {PolicyStatement} from 'aws-cdk-lib/aws-iam';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {Construct} from "constructs";
import * as path from "path";

export class Login extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: IUserPool,
        apiRootResource: IResource,
    }) {
        super(scope, id);

        const fnLogin = new LambdaTypescript(this, 'login', {
            entry: path.resolve(__dirname, './lambdas/login.ts'),
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
