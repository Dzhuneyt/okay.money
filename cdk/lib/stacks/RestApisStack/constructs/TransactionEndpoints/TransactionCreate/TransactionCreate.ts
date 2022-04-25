import {Construct} from "constructs";
import {AuthorizationType, IAuthorizer, IResource, LambdaIntegration} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../constructs/LambdaTypescript";
import * as path from "path";

export class TransactionCreate extends Construct {

    constructor(scope: Construct, id: string, private props: {
        rootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'TransactionCreate.lambda.ts'),
        });
        props.rootResource.resourceForPath('transaction').addMethod('POST', new LambdaIntegration(fn), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: props.authorizer,
        })
    }
}
