import {AttributeType, BillingMode, Table as BaseTable, TableProps} from 'aws-cdk-lib/aws-dynamodb';
import {RemovalPolicy} from "aws-cdk-lib";
import {Construct} from "constructs";
import {StringParameter} from "aws-cdk-lib/aws-ssm";

// @TODO for production, prefer to keep tables
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

        const prefix = `/finance/${process.env.ENV_NAME}`;

        new StringParameter(this, 'StringParameter-ARN', {
            stringValue: this.tableArn,
            parameterName: `${prefix}/table/${id}/arn`,
        });
        new StringParameter(this, 'StringParameter-NAME', {
            stringValue: this.tableName,
            parameterName: `${prefix}/table/${id}/name`,
        });
    }
}
