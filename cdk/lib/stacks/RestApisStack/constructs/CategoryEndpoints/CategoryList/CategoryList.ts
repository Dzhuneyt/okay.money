import {Construct} from "constructs";
import {AuthorizationType, IAuthorizer, IResource} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../constructs/LambdaTypescript";
import {LambdaIntegration} from "../../../../../constructs/LambdaIntegration";
import * as path from "path";

export class CategoryList extends Construct {

    constructor(scope: Construct, id: string, private props: {
        rootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'fn-category-list', {
            entry: path.resolve(__dirname, 'CategoryList.lambda.ts'),
        });
        props.rootResource.resourceForPath('category').addMethod('GET', new LambdaIntegration(fn), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: props.authorizer,
        });
    }
}
