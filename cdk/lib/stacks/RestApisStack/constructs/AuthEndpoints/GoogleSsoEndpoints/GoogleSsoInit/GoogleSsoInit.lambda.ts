import {APIGatewayProxyHandler} from "aws-lambda";
import {Handler} from "../../../../../../../lambdas/shared/Handler";
import {DynamoDB} from "aws-sdk";
import {v4} from "uuid";

async function getGoogleSsoInitUrl(state: string) {
    const url = new URL(
        "/oauth2/authorize",
        `https://okay-money-${process.env.ENV_NAME}.auth.${process.env.AWS_REGION}.amazoncognito.com`
    );
    url.searchParams.append("identity_provider", "Google");
    url.searchParams.append("redirect_url", process.env.CALLBACK_URL as string);
    url.searchParams.append("response_type", "code");
    url.searchParams.append("client_id", process.env.USERPOOL_CLIENT_ID as string);
    url.searchParams.append("state", state);

    return url.toString();
}

async function createStateFromDestinationUrl(destination: string) {
    const id = v4();
    const ttl = Math.round(new Date().getTime() / 1000) + 60 * 60 * 24; // 24 hours from now
    await new DynamoDB().putItem({
        TableName: process.env.TABLE_NAME_TEMPORARY_DESTINATIONS as string,
        Item: DynamoDB.Converter.marshall({
            id,
            destination,
            ttl,
        })
    }).promise()
    return id;
}

export const impl: APIGatewayProxyHandler = async (event) => {
    const destination = event.queryStringParameters?.destination;

    if (!destination) {
        return {
            statusCode: 400,
            body: JSON.stringify({error: 'Parameter "destination" is required'}),
        }
    }

    const state = await createStateFromDestinationUrl(destination);

    const redirectUrl = await getGoogleSsoInitUrl(state);

    return {
        statusCode: 301,
        headers: {
            Location: redirectUrl,
        },
        body: JSON.stringify({}),
    };
}
export const handler = new Handler(impl).create();
