import {AuthorizationType, IResource} from 'aws-cdk-lib/aws-apigateway';
import {IUserPool} from 'aws-cdk-lib/aws-cognito';
import {IRole, ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from 'aws-cdk-lib/aws-iam';
import {LambdaIntegration} from '../../../../constructs/LambdaIntegration';
import {LambdaTypescript} from '../../../../constructs/LambdaTypescript';
import {getPropsByLambdaFilename} from '../../../../constructs/rest/util/getLambdaCode';
import {Table} from "../../../../constructs/Table";
import * as path from "path";
import {Construct} from "constructs";

export class Register extends Construct {
    private readonly role: IRole;
    private tableForRegistrationTokens: Table;
    private apiResource: IResource;

    constructor(scope: Construct, id: string, private props: {
        userPool: IUserPool,
        apiRootResource: IResource,
    }) {
        super(scope, id);

        this.apiResource = props.apiRootResource.addResource('register');

        // Create the table to store registration requests (temporary tokens)
        this.tableForRegistrationTokens = this.getTableForRegistrationTokens();

        // Create the base Role to be assumed by all Registration related Lambdas
        this.role = this.getRoleForLambdas();

        this.createRegistrationEndpoint();
        this.createRegisterTokenGetEndpoint();
        this.createRegisterConfirmEndpoint();
    }

    private getRoleForLambdas(): IRole {
        const role = new Role(this, 'Role', {assumedBy: new ServicePrincipal('lambda.amazonaws.com')});

        role.addManagedPolicy(
            ManagedPolicy.fromManagedPolicyArn(this,
                'AWSLambdaBasicExecutionRole',
                'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'
            ),
        );
        role.addManagedPolicy(
            ManagedPolicy.fromManagedPolicyArn(this,
                'AWSXRayDaemonWriteAccess',
                'arn:aws:iam::aws:policy/AWSXRayDaemonWriteAccess'
            ),
        );

        this.tableForRegistrationTokens.grantReadWriteData(role);

        role.addToPrincipalPolicy(new PolicyStatement({
            sid: "AllowCreatingCognitoUsers",
            resources: [this.props.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:ListUsers",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));

        role.addToPrincipalPolicy(new PolicyStatement({
            actions: ['ses:SendEmail'],
            resources: ['*'],
        }))

        return role;
    }

    /**
     * Create table that stores one time (and temporary) registration tokens
     * appended to links that are sent to the user that registers
     * @private
     */
    private getTableForRegistrationTokens() {
        return new Table(this, 'RegistrationTokens', {});
    }

    private createRegistrationEndpoint() {
        const context = new Construct(this, 'register');
        const lambda = new LambdaTypescript(context, 'lambda', {
            ...getPropsByLambdaFilename('register.ts'),
            description: 'POST /api/register',
            role: this.role,
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

        this.apiResource
            .addMethod('POST', new LambdaIntegration(lambda), {
                authorizationType: AuthorizationType.NONE,
            });
    }

    private createRegisterConfirmEndpoint() {
        const context = new Construct(this, 'registerConfirm');
        const lambda = new LambdaTypescript(context, 'lambda', {
            ...getPropsByLambdaFilename('registerConfirm.ts'),
            role: this.role,
        });
        lambda.addEnvironment('TABLE_NAME_TOKENS', this.tableForRegistrationTokens.tableName);
        lambda.addEnvironment('COGNITO_USERPOOL_ID', this.props.userPool.userPoolId);
        this.apiResource
            .addResource('confirm')
            .addMethod('POST', new LambdaIntegration(lambda), {
                authorizationType: AuthorizationType.NONE,
            });
    }

    private createRegisterTokenGetEndpoint() {
        const context = new Construct(this, 'getRegistrationToken');
        const lambda = new LambdaTypescript(context, 'lambda', {
            description: 'GET /api/register/registrationToken',
            entry: path.resolve(__dirname, './lambdas/getRegistrationToken.ts'),
            role: this.role,
        });
        lambda.addEnvironment('TABLE_NAME_TOKENS', this.tableForRegistrationTokens.tableName);
        this.apiResource
            .addResource('registrationToken')
            .addMethod('GET', new LambdaIntegration(lambda), {
                authorizationType: AuthorizationType.NONE,
            });
    }
}
