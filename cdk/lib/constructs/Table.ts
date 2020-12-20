import {TableProps} from '@aws-cdk/aws-dynamodb/lib/table';
import {Construct, RemovalPolicy} from '@aws-cdk/core';
import {AttributeType, BillingMode, Table as BaseTable} from '@aws-cdk/aws-dynamodb';

const removalPolicy = RemovalPolicy.DESTROY;

export class Table extends BaseTable {
    constructor(scope: Construct, id: string, props: Partial<TableProps>) {
        super(scope, id, {
            ...props,
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            removalPolicy,
        });
    }
}
