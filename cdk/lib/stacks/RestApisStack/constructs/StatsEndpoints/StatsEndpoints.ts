import {AuthorizationType, IAuthorizer, IResource} from 'aws-cdk-lib/aws-apigateway';
import {Table} from 'aws-cdk-lib/aws-dynamodb';
import {Construct} from 'constructs';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {getPropsByLambdaFilename} from '../../../../constructs/rest/util/getLambdaCode';

export class StatsEndpoints extends Construct {
    constructor(scope: Construct, id: string, props: {
        apiRootResource: IResource,
        dynamoTables: {
            [key: string]: Table,
        },
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fnByCategory = new LambdaTypescript(this, 'fn-by-category', {
            ...getPropsByLambdaFilename('stats/byCategory.ts'),
        });

        props.apiRootResource
            .addResource('stats', {})
            .addResource('by_category')
            .addMethod('GET', new LambdaIntegration(fnByCategory), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: props.authorizer,
            });
    }
}
