import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {v4} from 'uuid';
import {DynamoDB, SES} from "aws-sdk";
import {userExistsInPool} from "./registerConfirm";

function getBaseUrl(event: IEvent) {
    return event.headers.origin;
}

async function emailRegistered(email: string) {
    return await userExistsInPool(email, process.env.COGNITO_USERPOOL_ID as string);
}

const getSubject = () => 'okay.money - Complete your registration';
const getBody = (type: "plaintext" | "html", confirmationLink: string) => {
    switch (type) {
        case "plaintext":
            return `We have received your registration request to okay.money. \n`
                + `To complete your registration, please confirm your email by visiting the following link: \n`
                + `${confirmationLink}\n\nNote that the link expires in 7 days. If you forget to visit it - don't worry`
                + ` - you will just need to resubmit your registration request.`;
        case "html":
            return `We have received your registration request to okay.money.<br/><br/>`
                + `To complete your registration, please confirm your email by <a href="${confirmationLink}">clicking here</a>.<br/><br/>`
                + `The link will expire in 7 days. If you forget to visit it - don't worry - `
                + `you will just need to resubmit your registration request.`
    }
    return "";
};

abstract class Mailer {
    constructor(
        protected from: string,
        protected to: string,
        protected subject: string,
        protected body: { plainText: string, html: string }
    ) {
    }

    abstract send(): Promise<boolean>;
}

class SesMailer extends Mailer {
    async send(): Promise<boolean> {
        const ses = new SES();
        const res = await ses.sendEmail({
            Destination: {
                ToAddresses: [this.to]
            },
            Source: this.from,
            Message: {
                Body: {
                    Html: {Data: this.body.html},
                    Text: {Data: this.body.plainText}
                },
                Subject: {Data: this.subject}
            },
        }).promise();
        console.log('SES email result', JSON.stringify(res, null, 2));
        return res.MessageId.length > 0
    }
}

async function sendEmail(config: {
    to: string,
    confirmationLink: string,
}) {
    const mailer = new SesMailer(
        'no-reply@okay.money',
        config.to,
        getSubject(),
        {
            plainText: getBody("plaintext", config.confirmationLink),
            html: getBody("html", config.confirmationLink),
        }
    );


    const emailResult = await mailer.send();

    console.log(emailResult);
}

export const handler = new Handler(async (event: IEvent) => {
    console.log(event);
    try {
        const body: {
            email: string,
        } = event.body ? JSON.parse(event.body) : {};

        if (!body.email) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Email is invalid',
                })
            };
        }

        if (await emailRegistered(body.email)) {
            return {
                statusCode: 400,
                body: JSON.stringify({message: "User already registered. Try logging in"}),
            }
        }

        const uuid = v4();

        await new DynamoDB().putItem({
            TableName: process.env.TABLE_NAME_TOKENS as string,
            Item: DynamoDB.Converter.marshall({
                id: uuid,
                email: body.email,
                // Expires in 7 days
                ttl: new Date().getTime() + 3600 * 24 * 7,
            }),
        }).promise();

        try {
            const confirmationLink = `${getBaseUrl(event)}/register?token=${uuid}`;
            console.log(confirmationLink);
            await sendEmail({
                confirmationLink,
                to: body.email,
            });
        } catch (e) {
            console.error(e);
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Failed to send a registration email. Try with a different email",
                })
            }
        }


        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
            })
        }
    } catch (e: any) {
        return {
            statusCode: 500,
            body: e.toString(),
        }
    }
}).create();
