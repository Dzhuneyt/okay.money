import {APIGatewayProxyResult} from 'aws-lambda';
import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';
import {Handler} from './shared/Handler';
import {SSM} from "aws-sdk";
import appName from "./appName";

interface Request {
    username: string;
    password: string;
}

export async function getCognitoUserPoolClientId() {
    const Name = `/${appName()}/pool/client/id`;
    try {
        const userPoolClientId = (await new SSM().getParameter({
            Name,
            WithDecryption: true,
        }).promise()).Parameter?.Value as string;

        if (userPoolClientId) {
            return userPoolClientId;
        }
    } catch (e) {
        console.error(e);
        console.error(`Can not find SSM parameter with name ${Name}`);
    }
    throw new Error(`Can not find SSM parameter with name ${Name}`);
}

const originalHandler = async (event: IEvent): Promise<APIGatewayProxyResult> => {
    console.log(event);
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const userPoolClientId = await getCognitoUserPoolClientId();
    const request: Request = JSON.parse(event.body as string);

    try {
        const result = await cognito.initiateAuth({
            ClientId: userPoolClientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: request.username,
                PASSWORD: request.password,
            },
        }).promise();

        if (result.AuthenticationResult) {
            console.log('AuthenticationResult',
                JSON.stringify(result.AuthenticationResult, null, 2));
            return {
                statusCode: 200,
                body: JSON.stringify(result.AuthenticationResult),
            }
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({error: "Invalid credentials"}),
            }
        }
    } catch (e: any) {
        if (e.code === 'UserNotFoundException') {
            return {
                statusCode: 400,
                body: JSON.stringify({error: "Invalid credentials"}),
            }
        }
        console.log(e);

        return {
            statusCode: 500,
            body: JSON.stringify({error: 'Login failed due to an internal error'}),
        }
    }
}
export const handler = new Handler(originalHandler).create();
