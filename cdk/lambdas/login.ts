import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import * as AWS from 'aws-sdk';

interface Request {
    username: string;
    password: string;
}

export const handler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.log(event);
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
            }
        } else {
            return {
                statusCode: 400,
                body: "Invalid credentials",
            }
        }
    } catch (e) {
        console.log(e);

        return {
            statusCode: 500,
            body: 'Login failed due to an internal error',
        }
    }


}
