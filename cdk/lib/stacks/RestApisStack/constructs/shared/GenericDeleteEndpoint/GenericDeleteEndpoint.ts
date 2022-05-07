import {Construct} from "constructs";
import {AuthorizationType, IAuthorizer, IResource} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../constructs/LambdaTypescript";
import * as path from "path";
import {LambdaIntegration} from "../../../../../constructs/LambdaIntegration";

export class GenericDeleteEndpoint extends Construct {

    constructor(scope: Construct, id: string, private props: {
        rootResource: IResource,
        authorizer: IAuthorizer,
        tableName: string,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'GenericDeleteEndpoint.lambda.ts'),
            environment: {
                TABLE_NAME: props.tableName,
            }
        });

        this.props.rootResource.addMethod('DELETE', new LambdaIntegration(fn), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.props.authorizer,
        });
    }
}
