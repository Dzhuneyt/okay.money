import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';
import {Handler} from './shared/Handler';

interface Request {
    username: string;
    password: string;
}

const originalHandler = async (event: IEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(event);
    console.log("context", context);
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const userPoolClientId = process.env.COGNITO_USERPOOL_CLIENT_ID as string;

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
            console.log('Logged in successfully');
            return {
                statusCode: 200,
                body: JSON.stringify(result.AuthenticationResult),
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    'Access-Control-Allow-Credentials': true,
                },
            }
        } else {
            return {
                statusCode: 400,
                body: "Invalid credentials",
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    'Access-Control-Allow-Credentials': true,
                },
            }
        }
    } catch (e) {
        console.log(e);

        return {
            statusCode: 500,
            body: 'Login failed due to an internal error',
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*",
                'Access-Control-Allow-Credentials': true,
            },
        }
    }
}
export const handler = new Handler(originalHandler).create();
