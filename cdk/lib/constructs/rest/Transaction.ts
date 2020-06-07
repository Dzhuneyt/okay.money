import {RestApi, TokenAuthorizer} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct, Duration} from '@aws-cdk/core';
import {Lambda} from '../Lambda';
import {LambdaIntegration} from '../LambdaIntegration';
import {getLambdaCode} from './getLambdaCode';

export class Transaction extends Construct {
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
        const fnTransactionCreate = new Lambda(this, 'fn-transaction-create', {
            code: getLambdaCode("transaction-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
            },
        });

        const transactions = props.api.root.addResource('transaction', {});
        const transaction = transactions.addResource('{id}');
        transactions.addMethod('POST', new LambdaIntegration(fnTransactionCreate), {
            authorizer: this.authorizer,
        })

        const fnTransactionList = new Lambda(this, 'fn-transaction-list', {
            code: getLambdaCode("transaction-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
            },
        });
        transactions.addMethod('GET', new LambdaIntegration(fnTransactionList), {
            authorizer: this.authorizer,
        });

        // Transaction view
        const fnView = new Lambda(this, 'fn-transaction-view', {
            code: getLambdaCode("transaction-view"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
            },
        });
        transaction
            .addMethod('GET', new LambdaIntegration(fnView), {
                authorizer: this.authorizer,
            });

        // Transaction edit
        const fnEdit = new Lambda(this, 'fn-transaction-edit', {
            code: getLambdaCode("transaction-edit"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
                TABLE_NAME_CATEGORIES: props.dynamoTables.category.tableName,
                TABLE_NAME_ACCOUNTS: props.dynamoTables.account.tableName,
            },
        });
        transaction
            .addMethod('PUT', new LambdaIntegration(fnEdit), {
                authorizer: this.authorizer,
            });

        // Transaction delete
        const fnDelete = new Lambda(this, 'fn-transaction-delete', {
            code: getLambdaCode("transaction-delete"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.transaction.tableName,
            },
        });
        transaction
            .addMethod('DELETE', new LambdaIntegration(fnDelete), {
                authorizer: this.authorizer,
            });
    }
}
