import {IResource} from '@aws-cdk/aws-apigateway';
import {IUserPool, UserPoolClient} from '@aws-cdk/aws-cognito';
import {Construct} from '@aws-cdk/core';
import {Login} from './Login';
import {Register} from './Register';
import {LambdaIntegration} from "../../../../constructs/LambdaIntegration";
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";
import * as path from "path";
import {PolicyStatement} from "@aws-cdk/aws-iam";

interface Props {
    userPool: IUserPool,
    apiRootResource: IResource,
}

export class AuthEndpoints extends Construct {

    constructor(scope: Construct, id: string, private props: Props) {
        super(scope, id);

        this.createLoginEndpoint();
        this.createRegisterEndpoint();
        this.createRefreshTokenEndpoint();
    }

    private createLoginEndpoint() {
        new Login(this, 'Login', {
            apiRootResource: this.props.apiRootResource,
            userPool: this.props.userPool,
        })
    }

    private createRegisterEndpoint() {
        new Register(this, 'Register', {
            apiRootResource: this.props.apiRootResource,
            userPool: this.props.userPool,
        })
    }

    private createRefreshTokenEndpoint() {
        this.props.apiRootResource
            .addResource('refreshToken')
            .addMethod('POST', new LambdaIntegration(
                new NodejsFunction(this, 'NodejsFunction-refreshToken', {
                    entry: path.resolve(__dirname, './lambdas/refreshToken.ts'),
                    initialPolicy: [
                        new PolicyStatement({
                            actions: ['ssm:Get*'],
                            resources: ['*'],
                        }),
                        new PolicyStatement({
                            actions: ["cognito-idp:InitiateAuth"],
                            resources: ['*'],
                        })
                    ],
                })
            ))
    }
}
