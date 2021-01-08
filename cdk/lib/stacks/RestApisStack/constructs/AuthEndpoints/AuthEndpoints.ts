import {IResource, IRestApi} from '@aws-cdk/aws-apigateway';
import {IUserPool} from '@aws-cdk/aws-cognito';
import {Construct} from '@aws-cdk/core';
import {Login} from './Login';
import {Register} from './Register';

interface Props {
    userPool: IUserPool,
    apiRootResource: IResource,
}

export class AuthEndpoints extends Construct {
    constructor(scope: Construct, id: string, private props: Props) {
        super(scope, id);
        this.createLoginEndpoint();
        this.createRegisterEndpoint();
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
}
