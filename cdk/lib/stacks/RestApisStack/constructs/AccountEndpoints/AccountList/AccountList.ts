import {Construct} from "constructs";
import {LambdaTypescript} from "../../../../../constructs/LambdaTypescript";
import * as path from "path";
import {AuthorizationType, IAuthorizer, IResource, LambdaIntegration} from "aws-cdk-lib/aws-apigateway";

export class AccountList extends Construct {

    constructor(scope: Construct, id: string, private props: {
        rootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fnAccountList = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'AccountList.lambda.ts'),
        });

        props.rootResource
            .resourceForPath('account')
            .addMethod('GET', new LambdaIntegration(fnAccountList), {
                authorizer: props.authorizer,
                authorizationType: AuthorizationType.COGNITO,
            });
    }
}
