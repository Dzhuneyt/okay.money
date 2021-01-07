import {AuthorizationType, IAuthorizer, RestApi} from '@aws-cdk/aws-apigateway';
import {Table} from '@aws-cdk/aws-dynamodb';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {getPropsByLambdaFilename} from '../../../../constructs/rest/util/getLambdaCode';

export class AccountEndpoints extends Construct {
    private readonly authorizer: IAuthorizer;

    constructor(scope: Construct, id: string, props: {
        api: RestApi,
        dynamoTables: {
            [key: string]: Table,
        },
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        this.authorizer = props.authorizer;

        const apiResources = this.createApiResources(props.api);

        const fnAccountList = new LambdaTypescript(this, 'fn-account-list', {
            ...getPropsByLambdaFilename('account-list.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
                TABLE_NAME_TRANSACTIONS: props.dynamoTables.transaction.tableName,
            }
        });
        apiResources.accounts.addMethod('GET', new LambdaIntegration(fnAccountList, {}), {
            authorizer: this.authorizer,
            authorizationType: AuthorizationType.COGNITO,
        });

        const fnAccountCreate = new LambdaTypescript(this, 'fn-account-create', {
            ...getPropsByLambdaFilename('account-create.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        apiResources.accounts.addMethod('POST', new LambdaIntegration(fnAccountCreate), {
            authorizer: this.authorizer,
            authorizationType: AuthorizationType.COGNITO,
        });

        const fnView = new LambdaTypescript(this, 'fn-account-view', {
            ...getPropsByLambdaFilename('genericViewHandle.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        apiResources.account
            .addMethod('GET', new LambdaIntegration(fnView), {
                authorizationType: AuthorizationType.COGNITO,
                authorizer: this.authorizer,
            });

        const fnEdit = new LambdaTypescript(this, 'fn-account-edit', {
            ...getPropsByLambdaFilename('account-edit.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        apiResources.account.addMethod('PUT', new LambdaIntegration(fnEdit), {
            authorizer: this.authorizer,
            authorizationType: AuthorizationType.COGNITO,
        });

        const fnDelete = new LambdaTypescript(this, 'fn-delete', {
            ...getPropsByLambdaFilename('genericDeleteHandler.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.account.tableName,
            }
        });
        apiResources.account.addMethod('DELETE', new LambdaIntegration(fnDelete), {
            authorizer: this.authorizer,
            authorizationType: AuthorizationType.COGNITO,
        });
    }

    private createApiResources(api: RestApi) {
        const accounts = api.root.addResource('account', {});
        const account = accounts.addResource('{id}');
        return {
            accounts,
            account
        };
    }
}
