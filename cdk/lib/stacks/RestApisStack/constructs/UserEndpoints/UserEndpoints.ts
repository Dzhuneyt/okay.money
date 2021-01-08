import {AuthorizationType, IAuthorizer, IResource, IRestApi} from '@aws-cdk/aws-apigateway';
import {IUserPool} from '@aws-cdk/aws-cognito';
import {ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from '@aws-cdk/aws-iam';
import {NodejsFunction} from '@aws-cdk/aws-lambda-nodejs';
import {Construct} from '@aws-cdk/core';
import * as path from 'path';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';

export class UserEndpoints extends Construct {
    constructor(scope: Construct, id: string, private props: {
        apiRootResource: IResource,
        userPool: IUserPool,
        authorizer: IAuthorizer,
    }) {
        super(scope, id);

        const role = new Role(this, 'Role', {
            assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
        });
        role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'));

        // Allow the Lambdas to retrieve users from DynamoDB
        role.addToPolicy(new PolicyStatement({
            actions: ["dynamodb:GetItem", 'dynamodb:PutItem'],
            resources: ["*"],
        }));

        // Allow the Lambdas to resolve SSM parameter values,
        // which contain references like table names
        role.addToPolicy(new PolicyStatement({
            actions: ["ssm:GetParameter"],
            resources: ["*"],
        }));

        // Allow to get the user from Cognito user pool
        role.addToPolicy(new PolicyStatement({
            actions: [
                'cognito-idp:ListUsers',
                'cognito-idp:InitiateAuth',
                'cognito-idp:AdminSetUserPassword',
            ],
            resources: [this.props.userPool.userPoolArn],
        }));

        const userResource = this.props.apiRootResource
            .addResource('user');

        const profileResource = userResource.addResource('profile', {});

        const lambdaProfileGet = new NodejsFunction(this, 'Lambda-GET-/user/profile', {
            entry: path.resolve(__dirname, './lambdas/getProfile.ts'),
            role,
        });
        profileResource.addMethod('GET', new LambdaIntegration(
            lambdaProfileGet,
        ), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.props.authorizer,
        });

        lambdaProfileGet.addEnvironment('ENV_NAME', process.env.ENV_NAME as string);
        lambdaProfileGet.addEnvironment('USER_POOL_ID', this.props.userPool.userPoolId);

        const lambdaProfileSave = new NodejsFunction(this, 'Lambda-PUT-/user/profile', {
            entry: path.resolve(__dirname, './lambdas/updateProfile.ts'),
            role,
        });
        lambdaProfileSave.addEnvironment('ENV_NAME', process.env.ENV_NAME as string);
        lambdaProfileSave.addEnvironment('USER_POOL_ID', this.props.userPool.userPoolId);
        profileResource.addMethod('PUT', new LambdaIntegration(
            lambdaProfileSave,
        ), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.props.authorizer,
        });
    }
}
