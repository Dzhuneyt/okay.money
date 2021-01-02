import {AuthorizationType, CfnAuthorizer, IAuthorizer, RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, StackProps} from '@aws-cdk/core';
import {Account} from '../../constructs/rest/account/Account';
import {Category} from '../../constructs/rest/category/Category';
import {Login} from '../../constructs/rest/Login';
import {Register} from '../../constructs/rest/Register';
import {Stats} from '../../constructs/rest/Stats';
import {Transaction} from '../../constructs/rest/Transaction';
import {ApiGateway} from './constructs/ApiGateway';

interface Props extends StackProps {
    userPool: UserPool;
    dynamoTables: {
        account: Table,
        category: Table,
        transaction: Table,
    };
}

export class RestApisStack extends cdk.Stack {
    private api: RestApi;
    private props: Props;
    private cognitoAuthorizer: IAuthorizer;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.props = props;

        this.createApiGateway();
        this.createApigatewayEndpoints();

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
    }

    private createApiGateway() {
        const apiGateway = new ApiGateway(this, 'ApiGateway', {
            userPool: this.props.userPool,
        });
        this.api = apiGateway.api;
        this.createCognitoAuthorizer();
    }

    private createApigatewayEndpoints() {
        new Login(this, 'login', {
            api: this.api,
            userPool: this.props.userPool,
        });
        new Register(this, 'register', {
            api: this.api,
            userPool: this.props.userPool,
        });
        new Account(this, 'account', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Category(this, 'category', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Transaction(this, 'transaction', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Stats(this, 'stats', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
    }

    private createCognitoAuthorizer() {
        const cognitoAuthorizer = new CfnAuthorizer(this, 'CognitoAuthorizer', {
            name: 'CognitoAuthorizer',
            identitySource: 'method.request.header.Authorization',
            providerArns: [this.props.userPool.userPoolArn],
            restApiId: this.api.restApiId,
            type: AuthorizationType.COGNITO,
        });
        // cognitoAuthorizer.node.addDependency(this.api);
        cognitoAuthorizer.node.addDependency(this.props.userPool);
        this.cognitoAuthorizer = {
            authorizerId: cognitoAuthorizer.ref,
            // authorizationType: AuthorizationType.COGNITO,
        }
    }
}
