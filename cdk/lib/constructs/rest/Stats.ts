import {AuthorizationType, IAuthorizer, RestApi} from '@aws-cdk/aws-apigateway';
import {Table} from '@aws-cdk/aws-dynamodb';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../LambdaIntegration';
import {LambdaTypescript} from '../LambdaTypescript';
import {getPropsByLambdaFilename} from './util/getLambdaCode';

export class Stats extends Construct {
    constructor(scope: Construct, id: string, props: {
        api: RestApi,
        dynamoTables: {
            [key: string]: Table,
        },
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const fnByCategory = new LambdaTypescript(this, 'fn-by-category', {
            ...getPropsByLambdaFilename('stats/byCategory.ts'),
        });

        props.api.root
            .addResource('stats', {})
            .addResource('by_category')
            .addMethod('GET', new LambdaIntegration(fnByCategory), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: props.authorizer,
            });
    }
}
