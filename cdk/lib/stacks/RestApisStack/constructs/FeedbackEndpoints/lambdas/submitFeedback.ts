import {CognitoIdentityServiceProvider, DynamoDB, SESV2, SSM} from 'aws-sdk';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {getUserByCognitoSub} from "../../UserEndpoints/lambdas/getProfile";

export const appName = () => `finance/${process.env.ENV_NAME}`;

async function changeCognitoUserPassword(Username: string, Password: string) {
    const UserPoolId = (await new SSM().getParameter({
        Name: `/${appName()}/pool/id`,
        WithDecryption: true,
    }).promise()).Parameter?.Value as string;
    const passwordUpdated = await new CognitoIdentityServiceProvider().adminSetUserPassword({
        Permanent: true,
        UserPoolId,
        Username,
        Password,
    }).promise();
    console.log(passwordUpdated);
    return true;
}

async function checkOldPasswordIsValid(Username: string, Password: string) {

    const userPoolClientId = (await new SSM().getParameter({
        Name: `/${appName()}/pool/client/id`,
        WithDecryption: true,
    }).promise()).Parameter?.Value as string;

    try {
        const result = await (new CognitoIdentityServiceProvider).initiateAuth({
            ClientId: userPoolClientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: Username,
                PASSWORD: Password,
            },
        }).promise();

        return !!result.AuthenticationResult;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const handler = new Handler(async (event: IEvent) => {
        console.log(event);
        const userId = event.requestContext.authorizer.claims.sub;

        const cognitoUser = await getUserByCognitoSub(userId, process.env.USER_POOL_ID as string);

        const parsedBody = JSON.parse(event.body as string);

        if (!parsedBody.message) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Feedback message not provided",
                }),
            }
        }

        const msg = await new SESV2().sendEmail({
            FromEmailAddress: "feedback@okay.money",
            Destination: {
                ToAddresses: ['jix2mail@gmail.com'],
            },
            Content: {
                Simple: {
                    Subject: {
                        Charset: "UTF-8",
                        Data: "Feedback from okay.money by user: " + cognitoUser?.Username,
                    },
                    Body: {
                        Text: {
                            Charset: "UTF-8",
                            Data: parsedBody.message,
                        }
                    },
                }
            }
        }).promise();

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                messageId: msg.MessageId,
            }),
        }
    }
).create()
