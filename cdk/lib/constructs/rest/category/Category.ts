import {AuthorizationType, IAuthorizer, RestApi} from '@aws-cdk/aws-apigateway';
import {Table} from '@aws-cdk/aws-dynamodb';
import {ManagedPolicy, Role, ServicePrincipal} from "@aws-cdk/aws-iam";
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../../LambdaIntegration';
import {LambdaTypescript} from '../../LambdaTypescript';
import {getPropsByLambdaFilename} from '../util/getLambdaCode';

export class Category extends Construct {
    private readonly authorizer: IAuthorizer;
    private readonly role: Role;

    constructor(scope: Construct, id: string, private props: {
        api: RestApi,
        dynamoTables: {
            [key: string]: Table,
        },
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        this.authorizer = props.authorizer;

        // Create a reusable Role to be assumed by all Lambdas in this construct
        this.role = new Role(this, 'Role', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        });
        this.role.addManagedPolicy(
            ManagedPolicy.fromManagedPolicyArn(this,
                'AWSLambdaBasicExecutionRole',
                'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
            ),
        );
        this.role.addManagedPolicy(
            ManagedPolicy.fromManagedPolicyArn(this,
                'AWSXRayDaemonWriteAccess',
                'arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess'
            ),
        );
        props.dynamoTables.category.grantReadWriteData(this.role);

        const apiResource = props.api.root.addResource('category', {});

        // Category listing
        const fnCategoryList = new LambdaTypescript(this, 'fn-category-list', {
            ...getPropsByLambdaFilename('category-list.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
            role: this.role,
        });
        apiResource.addMethod('GET', new LambdaIntegration(fnCategoryList), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        });

        // Category creation
        const fnCategoryCreate = new LambdaTypescript(this, 'fn-category-create', {
            ...getPropsByLambdaFilename('category-create.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
            role: this.role,
        });
        apiResource.addMethod('POST', new LambdaIntegration(fnCategoryCreate), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        });

        const singleApiResource = apiResource.addResource('{id}');

        // Category delete
        const fnCategoryDelete = new LambdaTypescript(this, 'fn-category-delete', {
            ...getPropsByLambdaFilename('genericDeleteHandler.ts'),
            environment: {
                TABLE_NAME: props.dynamoTables.category.tableName,
            },
            role: this.role,
        });

        singleApiResource.addMethod("DELETE", new LambdaIntegration(fnCategoryDelete), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        });

        singleApiResource.addMethod('GET', new LambdaIntegration(
            new LambdaTypescript(this, 'fn-category-view', {
                ...getPropsByLambdaFilename('genericViewHandle.ts'),
                environment: {
                    TABLE_NAME: props.dynamoTables.category.tableName,
                },
                role: this.role,
            })
        ), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        });

        // Update single category
        singleApiResource.addMethod('POST', new LambdaIntegration(
            new LambdaTypescript(this, 'fn-category-edit', {
                ...getPropsByLambdaFilename('category-edit.ts'),
                environment: {
                    TABLE_NAME: props.dynamoTables.category.tableName,
                },
                role: this.role,
            })
        ), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.authorizer,
        });
    }
}
