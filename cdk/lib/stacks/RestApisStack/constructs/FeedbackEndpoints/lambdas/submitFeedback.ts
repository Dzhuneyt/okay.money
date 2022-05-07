import {SESV2} from 'aws-sdk';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {getUserByCognitoSub} from "../../UserEndpoints/lambdas/getProfile";

export const handler = new Handler(async (event: IEvent) => {
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
            FromEmailAddress: "feedback-noreply@okay.money",
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
