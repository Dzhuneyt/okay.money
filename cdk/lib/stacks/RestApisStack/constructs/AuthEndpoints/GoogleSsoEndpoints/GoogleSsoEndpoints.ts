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

export const getCognitoCallbackUrlForEnv = () => {
    switch (process.env.ENV_NAME) {
        case 'dzhuneyt':
            return 'http://localhost';
        case 'master':
            return 'https://okay.money';
        case 'develop':
            return 'https://d2vib3tper0daj.cloudfront.net';
        default:
            return 'http://example.com/FIXME';
    }
}

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
        new UserPoolIdentityProviderGoogle(this, "Google", {
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

        const client = new UserPoolClientWithSecret(this, "UserPoolClient-Google", {
            userPool: props.userPool,
            generateSecret: true,
            supportedIdentityProviders: [UserPoolClientIdentityProvider.GOOGLE],
            oAuth: {
                callbackUrls: [getCognitoCallbackUrlForEnv() + '/api/auth/sso/google/finish'],
            },
        });

        new StringParameter(client, 'client-id', {
            parameterName: `/okay-money-${process.env.ENV_NAME}/userpool/google/client-id`,
            stringValue: client.userPoolClientId,
        })
        new StringParameter(client, 'client-secret', {
            parameterName: `/okay-money-${process.env.ENV_NAME}/userpool/google/client-secret`,
            stringValue: client.userPoolClientSecret,
        })

        new GoogleSsoInit(this, 'GoogleSsoInit', {
            rootResource: props.apiRootResource,
            userPool: props.userPool,
            userPoolClientId: client.userPoolClientId,
            userPoolClientSecret: client.userPoolClientSecret,
        });

        new GoogleSsoFinish(this, 'GoogleSsoFinish', {
            rootResource: props.apiRootResource,
            userPool: props.userPool,
            userPoolClientId: client.userPoolClientId,
            userPoolClientSecret: client.userPoolClientSecret,
        });
    }
}
