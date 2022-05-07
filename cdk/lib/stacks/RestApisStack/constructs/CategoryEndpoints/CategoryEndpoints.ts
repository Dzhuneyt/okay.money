import {IAuthorizer, IResource} from 'aws-cdk-lib/aws-apigateway';
import {Construct} from 'constructs';
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {GenericDeleteEndpoint} from "../shared/GenericDeleteEndpoint/GenericDeleteEndpoint";
import {GenericViewEndpoint} from "../shared/GenericViewEndpoint/GenericViewEndpoint";
import {CategoryList} from "./CategoryList/CategoryList";
import {CategoryCreate} from "./CategoryCreate/CategoryCreate";
import {CategoryEdit} from "./CategoryEdit/CategoryEdit";

export class CategoryEndpoints extends Construct {
    private readonly authorizer: IAuthorizer;

    constructor(scope: Construct, id: string, private props: {
        apiRootResource: IResource,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        this.authorizer = props.authorizer;

        const tableNameCategory = StringParameter.fromStringParameterName(this, 'TableName-Accounts', `/finance/${process.env.ENV_NAME}/table/category/name`).stringValue;

        new CategoryList(this, 'List', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        });
        new CategoryCreate(this, 'Create', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        })
        new CategoryEdit(this, 'Edit', {
            rootResource: props.apiRootResource,
            authorizer: props.authorizer,
        })

        new GenericViewEndpoint(this, 'View', {
            rootResource: props.apiRootResource.resourceForPath('category/{id}'),
            authorizer: props.authorizer,
            tableName: tableNameCategory,
        })
        new GenericDeleteEndpoint(this, 'Delete', {
            rootResource: props.apiRootResource.resourceForPath('category/{id}'),
            authorizer: props.authorizer,
            tableName: tableNameCategory,
        });


    }
}
