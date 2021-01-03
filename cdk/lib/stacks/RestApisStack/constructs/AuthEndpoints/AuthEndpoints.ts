import {IRestApi} from '@aws-cdk/aws-apigateway';
import {IUserPool} from '@aws-cdk/aws-cognito';
import {Construct} from '@aws-cdk/core';
import {Login} from './Login';
import {Register} from './Register';

interface Props {
    apiGateway: IRestApi,
    userPool: IUserPool,
}

export class AuthEndpoints extends Construct {
    constructor(scope: Construct, id: string, private props: Props) {
        super(scope, id);
        this.createLoginEndpoint();
        this.createRegisterEndpoint();
    }

    private createLoginEndpoint() {
        new Login(this, 'Login', {
            api: this.props.apiGateway,
            userPool: this.props.userPool,
        })
    }

    private createRegisterEndpoint() {
        new Register(this, 'Register', {
            api: this.props.apiGateway,
            userPool: this.props.userPool,
        })
    }
}
