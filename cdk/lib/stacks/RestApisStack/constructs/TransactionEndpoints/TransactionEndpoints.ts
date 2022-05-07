import {IAuthorizer, IResource} from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';
import {TransactionCreate} from "./TransactionCreate/TransactionCreate";
import {TransactionList} from "./TransactionList/TransactionList";
import {TransactionView} from "./TransactionView/TransactionView";
import {TransactionEdit} from "./TransactionEdit/TransactionEdit";
import {GenericDeleteEndpoint} from "../shared/GenericDeleteEndpoint/GenericDeleteEndpoint";
import {StringParameter} from "aws-cdk-lib/aws-ssm";

export class TransactionEndpoints extends Construct {

    constructor(scope: Construct, id: string, props: {
        apiRootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);


        new TransactionCreate(this, 'Create', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        })
        new TransactionList(this, 'List', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        })
        new TransactionView(this, 'View', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        })
        new TransactionEdit(this, 'Edit', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        })

        const tableNameTransactions = StringParameter.fromStringParameterName(this, 'TableName-Transactions', `/finance/${process.env.ENV_NAME}/table/transaction/name`).stringValue;
        new GenericDeleteEndpoint(this, 'Delete', {
            tableName: tableNameTransactions,
            rootResource: props.apiRootResource.resourceForPath('transaction/{id}'),
            authorizer: props.authorizer,
        })
    }
}
