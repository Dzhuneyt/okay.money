import {RestApi, TokenAuthorizer} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct, Duration} from '@aws-cdk/core';
import {Lambda} from '../Lambda';
import {LambdaIntegration} from '../LambdaIntegration';
import {getLambdaCode} from './getLambdaCode';

export class Category extends Construct {
    private readonly authorizer: TokenAuthorizer;

    constructor(scope: Construct, id: string, props: {
        api: RestApi,
        dynamoTables: {
            [key: string]: Table,
        },
        authorizer: TokenAuthorizer,
    }) {
        super(scope, id);

        this.authorizer = props.authorizer;

        const categories = props.api.root.addResource('category', {});

        // Category listing
        const fnCategoryList = new Lambda(this, 'fn-category-list', {
            code: getLambdaCode("category-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
        });
        categories.addMethod('GET', new LambdaIntegration(fnCategoryList), {
            authorizer: this.authorizer,
        });

        // Category creation
        const fnCategoryCreate = new Lambda(this, 'fn-category-create', {
            code: getLambdaCode("category-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
        });
        categories.addMethod('POST', new LambdaIntegration(fnCategoryCreate), {
            authorizer: this.authorizer,
        })
    }
}
