import {Construct} from "constructs";
import {LambdaIntegration} from "../../../../../constructs/LambdaIntegration";
import {AuthorizationType, IAuthorizer, IResource} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../constructs/LambdaTypescript";
import * as path from "path";

export class GenericViewEndpoint extends Construct {

    constructor(scope: Construct, id: string, private props: {
        rootResource: IResource,
        authorizer: IAuthorizer,
        tableName: string,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'GenericViewEndpoint.lambda.ts'),
            environment: {
                TABLE_NAME: props.tableName,
            }
        });

        this.props.rootResource.addMethod('GET', new LambdaIntegration(fn), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.props.authorizer,
        });

    }
}
