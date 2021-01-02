import {RestApi, TokenAuthorizer} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, Duration, StackProps} from '@aws-cdk/core';
import {LambdaTypescript} from '../../constructs/LambdaTypescript';
import {Account} from '../../constructs/rest/account/Account';
import {Category} from '../../constructs/rest/category/Category';
import {Login} from '../../constructs/rest/Login';
import {Register} from '../../constructs/rest/Register';
import {Stats} from '../../constructs/rest/Stats';
import {Transaction} from '../../constructs/rest/Transaction';
import {getPropsByLambdaFilename} from '../../constructs/rest/util/getLambdaCode';
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
    private authorizer: TokenAuthorizer;
    private props: Props;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.props = props;

        this.createApiGateway();
        this.createApigatewayEndpoints();

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
    }

    private createAuthorizerLambda() {
        const authFn = new LambdaTypescript(this, 'fn-authorizer', {
            ...getPropsByLambdaFilename('authorizer.ts'),
        });
        authFn.addToRolePolicy(new PolicyStatement({
            resources: [this.props.userPool.userPoolArn],
            actions: [
                "cognito-idp:GetUser",
            ],
        }));
        this.authorizer = new TokenAuthorizer(this, 'api-authorizer', {
            handler: authFn,
            resultsCacheTtl: Duration.seconds(0),
        });
    }

    private createApiGateway() {
        this.createAuthorizerLambda();

        const apiGateway = new ApiGateway(this, 'ApiGateway', {
            userPool: this.props.userPool,
        });
        this.api = apiGateway.api;
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
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Category(this, 'category', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Transaction(this, 'transaction', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new Stats(this, 'stats', {
            api: this.api,
            authorizer: this.authorizer,
            dynamoTables: this.props.dynamoTables,
        });
    }
}
