import {APIGatewayProxyHandler} from "aws-lambda";
import {Handler} from "../../../../../../../lambdas/shared/Handler";
import axios from "axios";
import {DynamoDB} from "aws-sdk";

async function getDestinationFromState(state: string) {
    const item = await new DynamoDB().getItem({
        TableName: process.env.TABLE_NAME_TEMPORARY_DESTINATIONS as string,
        Key: DynamoDB.Converter.marshall({id: state}),
    }).promise();

    if (!item.Item) {
        throw new Error(`Can not find destination from provided state`);
    }
    return DynamoDB.Converter.unmarshall(item.Item).destination as string;
}

export const impl: APIGatewayProxyHandler = async (event) => {
    const code = event.queryStringParameters?.code as string;
    const state = event.queryStringParameters?.state as string;

    if (!code || !state) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: "Invalid code or state parameter"}),
        }
    }

    const destination = await getDestinationFromState(state);

    const cognitoClientId = process.env.USERPOOL_CLIENT_ID as string;
    const cognitoClientSecret = process.env.USERPOOL_CLIENT_SECRET as string;

    const authorizationEncoded = Buffer.from(`${cognitoClientId}:${cognitoClientSecret}`).toString("base64");

    const params = new URLSearchParams(Object.entries({
        client_id: cognitoClientId,
        code,
        grant_type: "authorization_code",
        redirect_uri: process.env.CALLBACK_URL as string,
    }));

    const uniquePrefix = `okay-money-${process.env.ENV_NAME}`;
    const result = await axios.post(`https://${uniquePrefix}.auth.${process.env.AWS_REGION}.amazoncognito.com/oauth2/token`, params.toString(), {
        headers: {
            Authorization: `Basic ${authorizationEncoded}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    const credentials = {
        IdToken: result.data.id_token,
        AccessToken: result.data.access_token,
        RefreshToken: result.data.refresh_token,
        TokenType: "Bearer",
        ExpiresAt: Math.round(new Date().getTime() / 1000 + result.data.expires_in),
    };

    const url = new URL(destination);
    url.searchParams.append("credentials", JSON.stringify(credentials));

    return {
        statusCode: 301,
        headers: {
            Location: url.toString(),
        },
        body: JSON.stringify({}),
    }
}
export const handler = new Handler(impl).create();
