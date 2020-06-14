import {AttributeType, BillingMode} from '@aws-cdk/aws-dynamodb';
import {StringParameter} from '@aws-cdk/aws-ssm';
import {Construct, NestedStack, NestedStackProps, RemovalPolicy, Stack, StackProps} from '@aws-cdk/core';
import {Table} from '../constructs/Table';

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
        new StringParameter(this, 'param-table-accounts', {
            stringValue: this.tableAccount.tableArn,
            parameterName: '/personalfinance/table/accounts',
        });
        new StringParameter(this, 'param-table-categories', {
            stringValue: this.tableAccount.tableArn,
            parameterName: '/personalfinance/table/categories',
        });
        new StringParameter(this, 'param-table-transactions', {
            stringValue: this.tableAccount.tableArn,
            parameterName: '/personalfinance/table/transactions',
        });
    }
}
