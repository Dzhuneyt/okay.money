import {Construct} from "constructs";
import {
    IUserPool,
    ProviderAttribute,
    UserPoolClientIdentityProvider,
    UserPoolIdentityProviderGoogle
} from "aws-cdk-lib/aws-cognito";
import {IResource, RestApi} from "aws-cdk-lib/aws-apigateway";
import {CfnOutput, Stack} from "aws-cdk-lib";
import {GoogleSsoInit} from "./GoogleSsoInit/GoogleSsoInit";
import {UserPoolClientWithSecret} from "./UserPoolClientWithSecret";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {GoogleSsoFinish} from "./GoogleSsoFinish/GoogleSsoFinish";
import {Table} from "../../../../../constructs/Table";

export class GoogleSsoEndpoints extends Construct {

    constructor(scope: Construct, id: string, private props: {
        userPool: IUserPool,
        api: RestApi,
        apiRootResource: IResource,
    }) {
        super(scope, id);

        const uniquePrefix = `okay-money-${process.env.ENV_NAME}`;
        const redirectUrlForGoogle = `https://${uniquePrefix}.auth.${Stack.of(this).region}.amazoncognito.com/oauth2/idpresponse`;
        new CfnOutput(this, 'Google-SSO-Redirect-URL', {value: redirectUrlForGoogle});

        // Created at:
        // https://console.cloud.google.com/apis/credentials/oauthclient/912659792455-12vdr73q4q7bq14iu21dbrvfuup54kel.apps.googleusercontent.com?hl=bg&project=okay-money
        // using personal Google Cloud Console account
        const googleClientId = '912659792455-12vdr73q4q7bq14iu21dbrvfuup54kel.apps.googleusercontent.com';
        const googleClientSecret = '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';

        // Enable Google as an Identity Provider in this user pool
        const userPoolIdentityProviderGoogle = new UserPoolIdentityProviderGoogle(this, "Google", {
            userPool: this.props.userPool,
            clientId: googleClientId,
            clientSecret: googleClientSecret,

            // Email scope is required, because the default is 'profile' and that doesn't allow Cognito
            // to fetch the user's email from his Google account after the user does an SSO with Google
            scopes: ["email"],

            // Map fields from the user's Google profile to Cognito user fields, when the user is auto-provisioned
            attributeMapping: {
                email: ProviderAttribute.GOOGLE_EMAIL,
            },
        });

        const callbackUrl = `https://${props.api.restApiId}.execute-api.${Stack.of(props.api).region}.amazonaws.com/prod/api/auth/sso/google/finish`;

        const client = new UserPoolClientWithSecret(this, "UserPoolClient-Google", {
            userPool: props.userPool,
            generateSecret: true,
            supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
            oAuth: {
                callbackUrls: [callbackUrl],
            },
        });
        client.node.addDependency(userPoolIdentityProviderGoogle);

        new StringParameter(client, 'client-id', {
            parameterName: `/okay-money-${process.env.ENV_NAME}/userpool/google/client-id`,
            stringValue: client.userPoolClientId,
        })
        new StringParameter(client, 'client-secret', {
            parameterName: `/okay-money-${process.env.ENV_NAME}/userpool/google/client-secret`,
            stringValue: client.userPoolClientSecret,
        })

        // Table to store temporary destination URLs that are first passed to the "Google SSO init" endpoint,
        // stored in this table and ultimately retrieved and redirected to, by the "Google SSO finish" endpoint
        const tableForTemporaryDestinations = new Table(this, 'TemporaryDestinationsURLs', {
            timeToLiveAttribute: 'ttl',
        });

        new GoogleSsoInit(this, 'GoogleSsoInit', {
            rootResource: props.apiRootResource,
            userPool: props.userPool,
            userPoolClientId: client.userPoolClientId,
            userPoolClientSecret: client.userPoolClientSecret,
            tableForTemporaryDestinations,
            callbackUrl,
        });

        new GoogleSsoFinish(this, 'GoogleSsoFinish', {
            rootResource: props.apiRootResource,
            userPool: props.userPool,
            userPoolClientId: client.userPoolClientId,
            userPoolClientSecret: client.userPoolClientSecret,
            tableForTemporaryDestinations,
            callbackUrl,
        });
    }
}
