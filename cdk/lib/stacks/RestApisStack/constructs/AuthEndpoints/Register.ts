import {AuthorizationType, IResource} from 'aws-cdk-lib/aws-apigateway';
import {IUserPool} from 'aws-cdk-lib/aws-cognito';
import {PolicyStatement} from 'aws-cdk-lib/aws-iam';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {Table} from "../../../../constructs/Table";
import * as path from "path";
import {Construct} from "constructs";
import {RemovalPolicy} from "aws-cdk-lib";
import {BillingMode} from "aws-cdk-lib/aws-dynamodb";

export class Register extends Construct {
    private tableForRegistrationTokens: Table;
    private apiResource: IResource;

    constructor(scope: Construct, id: string, private props: {
        userPool: IUserPool,
        apiRootResource: IResource,
    }) {
        super(scope, id);

        this.apiResource = props.apiRootResource.addResource('register');

        // Create the table to store registration requests (temporary tokens)
        this.tableForRegistrationTokens = this._getTableForRegistrationTokens();

        this.createRegistrationEndpoint();
        this.createRegisterTokenGetEndpoint();
        this.createRegisterConfirmEndpoint();
    }

    /**
     * Create table that stores one time (and temporary) registration tokens
     * appended to the links that are sent to the user that registers
     */
    private _getTableForRegistrationTokens() {
        return new Table(this, 'registration-tokens', {
            removalPolicy: RemovalPolicy.DESTROY,
            billingMode: BillingMode.PAY_PER_REQUEST,
        });
    }

    private createRegistrationEndpoint() {
        const context = new Construct(this, 'register');
        const lambda = new LambdaTypescript(context, 'lambda', {
            entry: path.resolve(__dirname, './lambdas/register.ts'),
            description: 'POST /api/register',
        });
        lambda.addEnvironment('TABLE_NAME_TOKENS', this.tableForRegistrationTokens.tableName);
        lambda.addEnvironment('COGNITO_USERPOOL_ID', this.props.userPool.userPoolId);

        function getBaseUrl() {
            switch (process.env.ENV_NAME) {
                case 'master':
                    return 'https://okay.money/';
                default:
                    return 'http://localhost:4000/';
            }
        }

        lambda.addEnvironment('BASE_URL', getBaseUrl());

        this.tableForRegistrationTokens.grantReadWriteData(lambda);

        lambda.role?.addToPrincipalPolicy(new PolicyStatement({
            sid: "AllowCreatingCognitoUsers",
            resources: [this.props.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:ListUsers",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));

        lambda.role?.addToPrincipalPolicy(new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: ['*'],
        }))

        this.apiResource
            .addMethod('POST', new LambdaIntegration(lambda), {
                authorizationType: AuthorizationType.NONE,
            });
    }

    private createRegisterConfirmEndpoint() {
        const context = new Construct(this, 'RegisterConfirm');
        const lambda = new LambdaTypescript(context, 'lambda', {
            entry: path.resolve(__dirname, 'lambdas/registerConfirm.ts'),
        });
        lambda.addEnvironment('TABLE_NAME_TOKENS', this.tableForRegistrationTokens.tableName);
        lambda.addEnvironment('COGNITO_USERPOOL_ID', this.props.userPool.userPoolId);

        this.tableForRegistrationTokens.grantReadWriteData(lambda);

        lambda.role?.addToPrincipalPolicy(new PolicyStatement({
            sid: "AllowCreatingCognitoUsers",
            resources: [this.props.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:ListUsers",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));

        lambda.role?.addToPrincipalPolicy(new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: ['*'],
        }))

        this.apiResource
            .resourceForPath('confirm')
            .addMethod('POST', new LambdaIntegration(lambda), {
                authorizationType: AuthorizationType.NONE,
            });
    }

    private createRegisterTokenGetEndpoint() {
        const context = new Construct(this, 'getRegistrationToken');
        const lambda = new LambdaTypescript(context, 'lambda', {
            description: 'GET /api/register/registrationToken',
            entry: path.resolve(__dirname, './lambdas/getRegistrationToken.ts'),
        });
        lambda.addEnvironment('TABLE_NAME_TOKENS', this.tableForRegistrationTokens.tableName);

        this.tableForRegistrationTokens.grantReadWriteData(lambda);

        lambda.role?.addToPrincipalPolicy(new PolicyStatement({
            sid: "AllowCreatingCognitoUsers",
            resources: [this.props.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:ListUsers",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));

        lambda.role?.addToPrincipalPolicy(new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: ['*'],
        }))

        this.apiResource
            .addResource('registrationToken')
            .addMethod('GET', new LambdaIntegration(lambda), {
                authorizationType: AuthorizationType.NONE,
            });
    }
}
