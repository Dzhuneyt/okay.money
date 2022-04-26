import {CognitoUserPoolsAuthorizer, IAuthorizer, Resource, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {UserPool} from 'aws-cdk-lib/aws-cognito';
import * as cdk from 'aws-cdk-lib';
import {CfnOutput, Duration, StackProps} from 'aws-cdk-lib';
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
}

export class RestApisStack extends cdk.Stack {
    api: RestApi;
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
        new AuthEndpoints(this, 'auth', {
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
        });

        new UserEndpoints(this, 'user', {
            apiRootResource: this.apiRootResource,
            userPool: this.props.userPool,
            authorizer: this.cognitoAuthorizer,
        });

        new FeedbackEndpoints(this, 'feedback', {
            apiRootResource: this.apiRootResource,
            userPool: this.props.userPool,
            authorizer: this.cognitoAuthorizer,
        });
    }

    private createAuthorizer() {
        this.cognitoAuthorizer = new CognitoUserPoolsAuthorizer(this, 'Authorizer', {
            cognitoUserPools: [this.props.userPool],
            resultsCacheTtl: Duration.seconds(0),
        })
    }
}
