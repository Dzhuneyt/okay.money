import {CognitoUserPoolsAuthorizer, IAuthorizer, Resource, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {UserPool} from 'aws-cdk-lib/aws-cognito';
import {Table} from 'aws-cdk-lib/aws-dynamodb';
import * as cdk from 'aws-cdk-lib';
import {CfnOutput, StackProps} from 'aws-cdk-lib';
import {AccountEndpoints} from './constructs/AccountEndpoints/AccountEndpoints';
import {ApiGateway} from './constructs/ApiGateway';
import {AuthEndpoints} from './constructs/AuthEndpoints/AuthEndpoints';
import {CategoryEndpoints} from './constructs/CategoryEndpoints/CategoryEndpoints';
import {StatsEndpoints} from './constructs/StatsEndpoints/StatsEndpoints';
import {TransactionEndpoints} from './constructs/TransactionEndpoints/TransactionEndpoints';
import {UserEndpoints} from './constructs/UserEndpoints/UserEndpoints';
import {FeedbackEndpoints} from "./constructs/FeedbackEndpoints/FeedbackEndpoints";
import {Construct} from 'constructs';

interface Props extends StackProps {
    userPool: UserPool;
    dynamoTables: {
        account: Table,
        category: Table,
        transaction: Table,
    };
}

export class RestApisStack extends cdk.Stack {
    public api: RestApi;
    cognitoAuthorizer: IAuthorizer;
    apiRootResource: Resource;

    constructor(scope: Construct, id: string, private props: Props) {
        super(scope, id, props);

        this.createApiGateway();
        this.createAuthorizer();
        this.createEndpoints();

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
    }

    private createApiGateway() {
        const apiGateway = new ApiGateway(this, 'ApiGateway');
        this.api = apiGateway.api;
        this.apiRootResource = this.api.root.addResource('api');
    }

    private createEndpoints() {
        new AuthEndpoints(this, 'AuthEndpoints', {
            apiRootResource: this.apiRootResource,
            userPool: this.props.userPool,
        });
        new AccountEndpoints(this, 'account', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
        });
        new CategoryEndpoints(this, 'category', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
        });
        new TransactionEndpoints(this, 'transaction', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
        });
        new StatsEndpoints(this, 'stats', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });

        new UserEndpoints(this, 'ProfileEndpoints', {
            apiRootResource: this.apiRootResource,
            userPool: this.props.userPool,
            authorizer: this.cognitoAuthorizer,
        });

        new FeedbackEndpoints(this, 'FeedbackEndpoints', {
            apiRootResource: this.apiRootResource,
            userPool: this.props.userPool,
            authorizer: this.cognitoAuthorizer,
        });
    }

    private createAuthorizer() {
        this.cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
            cognitoUserPools: [this.props.userPool],
        })
    }
}
