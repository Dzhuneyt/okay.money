import {RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {StringParameter} from '@aws-cdk/aws-ssm';
import {Construct, Duration} from '@aws-cdk/core';
import {Lambda} from '../Lambda';
import {LambdaIntegration} from '../LambdaIntegration';
import {getLambdaCode} from './getLambdaCode';

export class Register extends Construct {
    constructor(scope: Construct, id: string, props: {
        userPool: UserPool,
        api: RestApi,
    }) {
        super(scope, id);

        const fnRegister = new Lambda(this, 'fn-register', {
            code: getLambdaCode("register"),
            handler: 'index.handler',
            timeout: Duration.seconds(30),
            initialPolicy: [
                new PolicyStatement({
                    sid: "AllowCreatingCognitoUsers",
                    resources: [props.userPool.userPoolArn],
                    actions: [
                        "cognito-idp:AdminCreateUser",
                        "cognito-idp:ListUsers",
                        "cognito-idp:AdminGetUser",
                        "cognito-idp:AdminSetUserPassword",
                    ]
                }),
            ]
        });
        // const fnRegister = new NodejsFunction(this, 'register', {
        //     projectRoot: path.resolve(__dirname, './../../../'),
        //     entry: './lambdas/register.ts',
        //     handler: 'handler',
        //     timeout: Duration.seconds(30),
        //     initialPolicy: [
        //         new PolicyStatement({
        //             sid: "AllowCreatingCognitoUsers",
        //             resources: [props.userPool.userPoolArn],
        //             actions: [
        //                 "cognito-idp:AdminCreateUser",
        //                 "cognito-idp:ListUsers",
        //                 "cognito-idp:AdminGetUser",
        //                 "cognito-idp:AdminSetUserPassword",
        //             ]
        //         }),
        //     ]
        // })
        fnRegister.addEnvironment('COGNITO_USERPOOL_ID', props.userPool.userPoolId);
        fnRegister.addEnvironment("TABLE_NAME_USERS", StringParameter.fromStringParameterName(this, 'param-table-name-users', '/personalfinance/table/users/name').stringValue)

        props.api.root
            .addResource('register')
            .addMethod('POST', new LambdaIntegration(fnRegister), {});
    }
}
