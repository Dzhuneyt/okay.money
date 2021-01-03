import {AuthorizationType, CfnAuthorizer, IAuthorizer, RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';
import {CfnOutput, StackProps} from '@aws-cdk/core';
import {AccountEndpoints} from './constructs/AccountEndpoints/AccountEndpoints';
import {ApiGateway} from './constructs/ApiGateway';
import {AuthEndpoints} from './constructs/AuthEndpoints/AuthEndpoints';
import {CategoryEndpoints} from './constructs/CategoryEndpoints/CategoryEndpoints';
import {StatsEndpoints} from './constructs/StatsEndpoints/StatsEndpoints';
import {TransactionEndpoints} from './constructs/TransactionEndpoints/TransactionEndpoints';
import {UserEndpoints} from './constructs/UserEndpoints/UserEndpoints';

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
        new AuthEndpoints(this, 'AuthEndpoints', {
            apiGateway: this.api,
            userPool: this.props.userPool,
        });
        new AccountEndpoints(this, 'account', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new CategoryEndpoints(this, 'category', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new TransactionEndpoints(this, 'transaction', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new StatsEndpoints(this, 'stats', {
            api: this.api,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });

        new UserEndpoints(this, 'ProfileEndpoints', {
            apiGateway: this.api,
            userPool: this.props.userPool,
            authorizer: this.cognitoAuthorizer,
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
