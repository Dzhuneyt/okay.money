import {IEvent} from "../../../../../../lambdas/interfaces/IEvent";
import * as AWS from "aws-sdk";
import {SSM} from "aws-sdk";
import {appName} from "../../FeedbackEndpoints/lambdas/submitFeedback";
import {getCognitoUserPoolClientId} from "../../../../../../lambdas/login";

interface RefreshTokenRequest {
    refreshToken: string,
}

export const handler = async (event: IEvent) => {
    console.log(event);

    try {
        const cognito = new AWS.CognitoIdentityServiceProvider();
        const userPoolClientId = await getCognitoUserPoolClientId();

        const request: RefreshTokenRequest = JSON.parse(event.body as string);
        const result = await cognito.initiateAuth({
            ClientId: userPoolClientId,
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            AuthParameters: {
                REFRESH_TOKEN: request.refreshToken,
            },
        }).promise();

        console.log(result);

        return {
            statusCode: 200,
            body: JSON.stringify({
                IdToken: result.AuthenticationResult?.IdToken,
                AccessToken: result.AuthenticationResult?.AccessToken,
                ExpiresIn: result.AuthenticationResult?.ExpiresIn,
            })
        }
    } catch (e) {
        console.error(e);
        if (e.message && e.message.includes('Refresh Token has expired')) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: e.message,
                })
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({message: "Internal error with refreshing token"}),
        }
    }

}
