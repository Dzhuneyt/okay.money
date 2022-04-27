import {APIGatewayProxyHandler} from "aws-lambda";
import {Handler} from "../../../../../../../lambdas/shared/Handler";
import {getCognitoCallbackUrlForEnv} from "../GoogleSsoEndpoints";

async function getGoogleSsoInitUrl() {
    const callbackUrl = getCognitoCallbackUrlForEnv() + '/api/auth/sso/google/finish';

    const url = new URL(
        "/oauth2/authorize",
        `https://okay-money-${process.env.ENV_NAME}.auth.${process.env.AWS_REGION}.amazoncognito.com`
    );
    url.searchParams.append("identity_provider", "Google");
    url.searchParams.append("redirect_url", callbackUrl);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", process.env.USERPOOL_CLIENT_ID as string);
    url.searchParams.append("state", JSON.stringify({
        final_destination: callbackUrl,
    }));

    return url.toString();
}

export const impl: APIGatewayProxyHandler = async () => {
    const redirectUrl = await getGoogleSsoInitUrl();

    return {
        statusCode: 200,
        // headers: {
        //     Location: redirectUrl,
        // },
        body: JSON.stringify({
            redirectUrl,
        }),
    };
}
export const handler = new Handler(impl).create();
