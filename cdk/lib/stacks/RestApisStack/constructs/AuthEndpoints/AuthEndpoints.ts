import {IResource, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {IUserPool} from 'aws-cdk-lib/aws-cognito';
import {Login} from './Login';
import {Register} from './Register';
import {LambdaIntegration} from "../../../../constructs/LambdaIntegration";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import {Construct} from 'constructs';
import {GoogleSsoEndpoints} from "./GoogleSsoEndpoints/GoogleSsoEndpoints";

interface Props {
    userPool: IUserPool,
    api: RestApi,
    apiRootResource: IResource,
}

export class AuthEndpoints extends Construct {

    constructor(scope: Construct, id: string, private props: Props) {
        super(scope, id);

        this.createLoginEndpoint();
        this.createRegisterEndpoint();
        this.createRefreshTokenEndpoint();
        this.createGoogleSsoInitEndpoint();
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
            .resourceForPath('refreshToken')
            .addMethod('POST', new LambdaIntegration(
                new NodejsFunction(this, 'NodejsFunction-refreshToken', {
                    entry: path.resolve(__dirname, './lambdas/refreshToken.ts'),
                    description: 'POST /api/refreshToken',
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

    private createGoogleSsoInitEndpoint() {
        new GoogleSsoEndpoints(this, 'GoogleSsoEndpoints', {
            api: this.props.api,
            apiRootResource: this.props.apiRootResource,
            userPool: this.props.userPool,
        });
    }
}
