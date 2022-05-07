import {Table} from '../../constructs/Table';
import {AttributeType} from "aws-cdk-lib/aws-dynamodb";
import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";

export class DynamoDBStack extends Stack {

    public tableAccount: Table;
    public tableCategory: Table;
    public tableTransaction: Table;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);
        this.createTables();
    }

    private createTables() {
        this.tableAccount = new Table(this, 'account', {});
        this.exportValue(this.tableAccount.tableName);
        this.tableAccount.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });

        this.tableCategory = new Table(this, 'category', {});
        this.exportValue(this.tableCategory.tableName);
        this.exportValue(this.tableCategory.tableArn);
        this.tableCategory.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });

        this.tableTransaction = new Table(this, 'transaction', {});
        this.exportValue(this.tableTransaction.tableName);
        this.tableTransaction.addGlobalSecondaryIndex({
            indexName: 'author_id',
            partitionKey: {
                type: AttributeType.STRING,
                name: "author_id",
            },
        });
    }

}
