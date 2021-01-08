import {AuthorizationType, IAuthorizer, IResource, RestApi} from '@aws-cdk/aws-apigateway';
import {Table} from '@aws-cdk/aws-dynamodb';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {getPropsByLambdaFilename} from '../../../../constructs/rest/util/getLambdaCode';

export class TransactionEndpoints extends Construct {
    private readonly authorizer: IAuthorizer;

    constructor(scope: Construct, id: string, props: {
        apiRootResource: IResource,
        dynamoTables: {
            [key: string]: Table,
        },
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        this.authorizer = props.authorizer;
        const fnTransactionCreate = new LambdaTypescript(this, 'fn-transaction-create', {
            ...getPropsByLambdaFilename('transaction-create.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
            },
        });

        const transactions = props.apiRootResource
            .addResource('transaction', {});
        const transaction = transactions.addResource('{id}');
        transactions.addMethod('POST', new LambdaIntegration(fnTransactionCreate), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        })

        const fnTransactionList = new LambdaTypescript(this, 'fn-transaction-list', {
            ...getPropsByLambdaFilename('transaction-list.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
            },
        });
        transactions.addMethod('GET', new LambdaIntegration(fnTransactionList), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        });

        // Transaction view
        const fnView = new LambdaTypescript(this, 'fn-transaction-view', {
            ...getPropsByLambdaFilename('transaction-view.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
            },
        });
        transaction
            .addMethod('GET', new LambdaIntegration(fnView), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: this.authorizer,
            });

        // Transaction edit
        const fnEdit = new LambdaTypescript(this, 'fn-transaction-edit', {
            ...getPropsByLambdaFilename('transaction-edit.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
            },
        });
        transaction
            .addMethod('PUT', new LambdaIntegration(fnEdit), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: this.authorizer,
            });

        // Transaction delete
        const fnDelete = new LambdaTypescript(this, 'fn-transaction-delete', {
            ...getPropsByLambdaFilename('transaction-delete.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
            },
        });
        transaction
            .addMethod('DELETE', new LambdaIntegration(fnDelete), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: this.authorizer,
            });
    }
}
