import {AuthorizationType, RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {ManagedPolicy, PolicyStatement, Role, ServicePrincipal} from '@aws-cdk/aws-iam';
import {Construct} from '@aws-cdk/core';
import {LambdaIntegration} from '../LambdaIntegration';
import {LambdaTypescript} from '../LambdaTypescript';
import {Table} from "../Table";
import {getPropsByLambdaFilename} from './util/getLambdaCode';

export class Register extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: UserPool,
        api: RestApi,
    }) {
        super(scope, id);

        const apiResourceRegister = props.api.root
            .addResource('register');

        const tableForTokens = new Table(this, 'RegistrationTokens', {});

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

        tableForTokens.grantReadWriteData(role);
        role.addToPolicy(new PolicyStatement({
            sid: "AllowCreatingCognitoUsers",
            resources: [props.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:ListUsers",
                "cognito-idp:AdminGetUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));

        const fnRegister = new LambdaTypescript(this, 'fn-register', {
            ...getPropsByLambdaFilename('register.ts'),
            role,
        });
        fnRegister.addEnvironment('TABLE_NAME_TOKENS', tableForTokens.tableName);
        fnRegister.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);

        apiResourceRegister
            .addMethod('POST', new LambdaIntegration(fnRegister), {
                authorizationType: AuthorizationType.NONE,
            });

        const fnRegisterConfirm = new LambdaTypescript(this, 'fn-register-confirm', {
            ...getPropsByLambdaFilename('registerConfirm.ts'),
            role,
        });
        fnRegisterConfirm.addEnvironment('TABLE_NAME_TOKENS', tableForTokens.tableName);
        fnRegisterConfirm.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);
        apiResourceRegister
            .addResource('confirm')
            .addMethod('POST', new LambdaIntegration(fnRegisterConfirm), {
                authorizationType: AuthorizationType.NONE,
            });
    }
}
