import {RestApi, TokenAuthorizer} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct, Duration} from '@aws-cdk/core';
import {Lambda} from '../Lambda';
import {LambdaIntegration} from '../LambdaIntegration';
import {getLambdaCode} from './getLambdaCode';

export class Account extends Construct {
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
        const accounts = props.api.root.addResource('account', {});
        const account = accounts.addResource('{id}', {});

        const fnAccountList = new Lambda(this, 'fn-account-list', {
            code: getLambdaCode("account-list"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
                TABLE_NAME_TRANSACTIONS: props.dynamoTables.transaction.tableName,
            }
        });
        props.dynamoTables.account.grantReadData(fnAccountList);
        accounts.addMethod('GET', new LambdaIntegration(fnAccountList, {}), {
            authorizer: this.authorizer,
        });

        const fnAccountCreate = new Lambda(this, 'fn-account-create', {
            code: getLambdaCode("account-create"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        props.dynamoTables.account.grantReadWriteData(fnAccountCreate);
        accounts.addMethod('POST', new LambdaIntegration(fnAccountCreate), {
            authorizer: this.authorizer,
        });

        const fnView = new Lambda(this, 'fn-account-view', {
            code: getLambdaCode("account-view"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        account
            .addMethod('GET', new LambdaIntegration(fnView), {
                authorizer: this.authorizer,
            });

        const fnEdit = new Lambda(this, 'fn-account-edit', {
            code: getLambdaCode("account-edit"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        account
            .addMethod('PUT', new LambdaIntegration(fnEdit), {
                authorizer: this.authorizer,
            });

        const fnDelete = new Lambda(this, 'fn-delete', {
            code: getLambdaCode("account-delete"),
            handler: 'index.handler',
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        account
            .addMethod('DELETE', new LambdaIntegration(fnDelete), {
                authorizer: this.authorizer,
            });
    }
}
