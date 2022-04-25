import {AuthorizationType, IAuthorizer, IResource} from 'aws-cdk-lib/aws-apigateway';
import {IUserPool} from 'aws-cdk-lib/aws-cognito';
import {ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import { Construct } from 'constructs';
import * as path from 'path';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';

export class FeedbackEndpoints extends Construct {
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

        // Allow the Lambdas to send emails using SES
        role.addToPolicy(new PolicyStatement({
            actions: ["ses:SendEmail"],
            resources: ["*"],
        }));

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

        const feedbackResource = this.props.apiRootResource
            .addResource('feedback');

        const submitFeedbackLambda = new NodejsFunction(this, 'NodejsFunction-submitFeedback', {
            entry: path.resolve(__dirname, './lambdas/submitFeedback.ts'),
            role,
        });
        feedbackResource.addMethod('POST', new LambdaIntegration(
            submitFeedbackLambda,
        ), {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: this.props.authorizer,
        });

        submitFeedbackLambda.addEnvironment('ENV_NAME', process.env.ENV_NAME as string);
        submitFeedbackLambda.addEnvironment('USER_POOL_ID', this.props.userPool.userPoolId);
    }
}
