import {RestApi, TokenAuthorizer} from '@aws-cdk/aws-apigateway';
import {Table} from '@aws-cdk/aws-dynamodb';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../../LambdaIntegration';
import {LambdaTypescript} from '../../LambdaTypescript';
import {getPropsByLambdaFilename} from '../util/getLambdaCode';

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

        const categoriesApiResource = props.api.root.addResource('category', {});

        // Category listing
        const fnCategoryList = new LambdaTypescript(this, 'fn-category-list', {
            ...getPropsByLambdaFilename('category-list.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
        });
        categoriesApiResource.addMethod('GET', new LambdaIntegration(fnCategoryList), {
            authorizer: this.authorizer,
        });

        // Category creation
        const fnCategoryCreate = new LambdaTypescript(this, 'fn-category-create', {
            ...getPropsByLambdaFilename('category-create.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
        });
        categoriesApiResource.addMethod('POST', new LambdaIntegration(fnCategoryCreate), {
            authorizer: this.authorizer,
        })
    }
}
