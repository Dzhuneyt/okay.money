import {Construct} from "constructs";
import {IUserPool} from "aws-cdk-lib/aws-cognito";
import {AuthorizationType, IResource, LambdaIntegration} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../../constructs/LambdaTypescript";
import * as path from "path";

export class GoogleSsoInit extends Construct {

    constructor(scope: Construct, id: string, private props: {
        userPool: IUserPool,
        rootResource: IResource,
        userPoolClientId: string,
        userPoolClientSecret: string,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'GoogleSsoInit.lambda.ts'),
            environment: {
                USERPOOL_CLIENT_ID: props.userPoolClientId,
                USERPOOL_CLIENT_SECRET: props.userPoolClientSecret,
            }
        })
        props.rootResource
            .resourceForPath('auth/sso/google/init')
            .addMethod('GET', new LambdaIntegration(fn), {
                authorizationType: AuthorizationType.NONE,
            });
    }
}
