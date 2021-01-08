import {AuthorizationType, CfnAuthorizer, IAuthorizer, Resource, RestApi} from '@aws-cdk/aws-apigateway';
import {UserPool} from '@aws-cdk/aws-cognito';
import {Table} from '@aws-cdk/aws-dynamodb';
import * as cdk from '@aws-cdk/core';
import {Aspects, CfnOutput, IConstruct, StackProps} from '@aws-cdk/core';
import {AccountEndpoints} from './constructs/AccountEndpoints/AccountEndpoints';
import {ApiGateway} from './constructs/ApiGateway';
import {AuthEndpoints} from './constructs/AuthEndpoints/AuthEndpoints';
import {CategoryEndpoints} from './constructs/CategoryEndpoints/CategoryEndpoints';
import {StatsEndpoints} from './constructs/StatsEndpoints/StatsEndpoints';
import {TransactionEndpoints} from './constructs/TransactionEndpoints/TransactionEndpoints';
import {UserEndpoints} from './constructs/UserEndpoints/UserEndpoints';
import {NodejsFunction} from "@aws-cdk/aws-lambda-nodejs";

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
    private props: Props;
    private cognitoAuthorizer: IAuthorizer;
    private apiRootResource: Resource;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        this.props = props;

        this.createApiGateway();
        this.createApigatewayEndpoints();

        this.attachEnvNameToLambdas();

        new CfnOutput(this, 'rest-api', {
            value: this.api.url,
        });
    }

    private createApiGateway() {
        const apiGateway = new ApiGateway(this, 'ApiGateway', {
            userPool: this.props.userPool,
        });
        this.api = apiGateway.api;
        this.apiRootResource = this.api.root.addResource('api');
        this.createCognitoAuthorizer();
    }

    private createApigatewayEndpoints() {
        new AuthEndpoints(this, 'AuthEndpoints', {
            apiRootResource: this.apiRootResource,
            userPool: this.props.userPool,
        });
        new AccountEndpoints(this, 'account', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new CategoryEndpoints(this, 'category', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
        });
        new TransactionEndpoints(this, 'transaction', {
            apiRootResource: this.apiRootResource,
            authorizer: this.cognitoAuthorizer,
            dynamoTables: this.props.dynamoTables,
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

    private attachEnvNameToLambdas() {
        Aspects.of(this).add({
            visit(node: IConstruct) {
                // Make the ENV_NAME variable available to all Lambdas
                if (node instanceof NodejsFunction) {
                    node.addEnvironment('ENV_NAME', process.env.ENV_NAME as string);
                }
            }
        })
    }
}
