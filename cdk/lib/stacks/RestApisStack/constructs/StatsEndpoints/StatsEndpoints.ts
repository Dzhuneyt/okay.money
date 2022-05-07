import {AuthorizationType, IAuthorizer, IResource} from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import * as path from "path";

export class StatsEndpoints extends Construct {
    constructor(scope: Construct, id: string, props: {
        apiRootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fnByCategory = new LambdaTypescript(this, 'fn-by-category', {
            entry: path.resolve(__dirname, 'ByCategory/ByCategory.lambda.ts'),
        });

        props.apiRootResource
            .resourceForPath('stats/by-category')
            .addMethod('GET', new LambdaIntegration(fnByCategory), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: props.authorizer,
            });
    }
}
