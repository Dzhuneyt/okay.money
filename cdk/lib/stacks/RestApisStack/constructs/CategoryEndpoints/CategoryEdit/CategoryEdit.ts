import {Construct} from "constructs";
import {AuthorizationType, IAuthorizer, IResource} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../constructs/LambdaTypescript";
import {LambdaIntegration} from "../../../../../constructs/LambdaIntegration";
import * as path from "path";

export class CategoryEdit extends Construct {

    constructor(scope: Construct, id: string, private props: {
        rootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'CategoryEdit.lambda.ts'),
        });
        props.rootResource.resourceForPath('category/{id}').addMethod('POST', new LambdaIntegration(fn), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: props.authorizer,
        });
    }
}
