import {AttributeType} from '@aws-cdk/aws-dynamodb';
import {StringParameter} from '@aws-cdk/aws-ssm';
import {Construct, Stack, StackProps} from '@aws-cdk/core';
import {Table} from '../../constructs/Table';

export class DynamoDBStack extends Stack {

    public tableAccount: Table;
    public tableCategory: Table;
    public tableTransaction: Table;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.createDynamoDBtables();
        this.storeInParameterStore();
    }

    private createDynamoDBtables() {
        this.tableAccount = new Table(this, 'account', {});
        this.tableCategory = new Table(this, 'category', {});
        this.tableTransaction = new Table(this, 'transaction', {});

        this.tableAccount.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });
        this.tableCategory.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });
        this.tableTransaction.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });
    }

    private storeInParameterStore() {
        const appName = `finance-${process.env.ENV_NAME}`;

        new StringParameter(this, 'accounts-arn', {
            stringValue: this.tableAccount.tableArn,
            parameterName: `/${appName}/table/accounts/arn`,
        });
        new StringParameter(this, 'accounts-name', {
            stringValue: this.tableAccount.tableName,
            parameterName: `/${appName}/table/accounts/name`,
        });
        new StringParameter(this, 'categories-arn', {
            stringValue: this.tableCategory.tableArn,
            parameterName: `/${appName}/table/categories/arn`,
        });
        new StringParameter(this, 'categories-name', {
            stringValue: this.tableCategory.tableName,
            parameterName: `/${appName}/table/categories/name`,
        });
        new StringParameter(this, 'transactions-arn', {
            stringValue: this.tableTransaction.tableArn,
            parameterName: `/${appName}/table/transactions/arn`,
        });
        new StringParameter(this, 'transactions-name', {
            stringValue: this.tableTransaction.tableName,
            parameterName: `/${appName}/table/transactions/name`,
        });
    }
}
