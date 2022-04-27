import {APIGatewayProxyHandler} from "aws-lambda";
import {Handler} from "../../../../../../../lambdas/shared/Handler";
import axios from "axios";
import {getCognitoCallbackUrlForEnv} from "../GoogleSsoEndpoints";

export const impl: APIGatewayProxyHandler = async (event) => {
    const code = event.queryStringParameters?.code as string;
    const state = event.queryStringParameters?.state;

    const cognitoClientId = process.env.USERPOOL_CLIENT_ID as string;
    const cognitoClientSecret = process.env.USERPOOL_CLIENT_SECRET as string;

    const authorizationEncoded = Buffer.from(`${cognitoClientId}:${cognitoClientSecret}`).toString("base64");

    const params = new URLSearchParams(Object.entries({
        client_id: cognitoClientId,
        code,
        grant_type: "authorization_code",
        redirect_uri: getCognitoCallbackUrlForEnv() + '/api/auth/sso/google/finish',
    }));

    const uniquePrefix = `okay-money-${process.env.ENV_NAME}`;
    const result = await axios.post(`https://${uniquePrefix}.auth.${process.env.AWS_REGION}.amazoncognito.com/oauth2/token`, params.toString(), {
        headers: {
            Authorization: `Basic ${authorizationEncoded}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const credentials = result.data; // Contains {IdToken, AccessToken, RefreshToken...}

    return {
        statusCode: 200,
        body: JSON.stringify({
            code, state, credentials,
        }),
    }
}
export const handler = new Handler(impl).create();
