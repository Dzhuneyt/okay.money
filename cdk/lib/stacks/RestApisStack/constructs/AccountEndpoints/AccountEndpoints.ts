import {IAuthorizer, IResource} from 'aws-cdk-lib/aws-apigateway';
import {Construct} from "constructs";
import {AccountList} from "./AccountList/AccountList";
import {AccountCreate} from "./AccountCreate/AccountCreate";
import {AccountEdit} from "./AccountEdit/AccountEdit";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {GenericViewEndpoint} from "../shared/GenericViewEndpoint/GenericViewEndpoint";
import {GenericDeleteEndpoint} from "../shared/GenericDeleteEndpoint/GenericDeleteEndpoint";

export class AccountEndpoints extends Construct {

    constructor(scope: Construct, id: string, private props: {
        apiRootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        new AccountList(this, 'List', {
            rootResource: props.apiRootResource,
            authorizer: this.props.authorizer,
        });

        new AccountCreate(this, 'Create', {
            rootResource: props.apiRootResource,
            authorizer: this.props.authorizer,
        });
        new AccountEdit(this, 'Edit', {
            rootResource: props.apiRootResource,
            authorizer: this.props.authorizer,
        });

        const tableNameAccounts = StringParameter.fromStringParameterName(this, 'TableName-Accounts', `/finance/${process.env.ENV_NAME}/table/account/name`).stringValue;

        new GenericViewEndpoint(this, 'View', {
            rootResource: props.apiRootResource.resourceForPath('account/{id}'),
            authorizer: this.props.authorizer,
            tableName: tableNameAccounts,
        });
        new GenericDeleteEndpoint(this, 'Delete', {
            rootResource: props.apiRootResource.resourceForPath('account/{id}'),
            authorizer: this.props.authorizer,
            tableName: tableNameAccounts,
        });
    }

}
