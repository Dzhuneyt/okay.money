import {IEvent} from './interfaces/IEvent';
import {Handler} from './shared/Handler';
import {v4} from 'uuid';
import {DynamoDB, SES} from "aws-sdk";
import {MailDataRequired} from "@sendgrid/helpers/classes/mail";
import {userExistsInPool} from "./registerConfirm";


function getBaseUrl(event: IEvent) {
    return event.headers.origin;
}

async function emailRegistered(email: string) {
    return await userExistsInPool(email, process.env.COGNITO_USERPOOL_ID as string);
}

const getFromEmail = () => 'no-reply-registration@em5577.dzhuneyt.com';
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

class SendGridMailer extends Mailer {
    async send(): Promise<boolean> {
        const msg: MailDataRequired = {
            // Prevent emails from ending up in spam, by disabling link cloaking
            // and embedding a pixel image inside email HTML
            trackingSettings: {
                clickTracking: {enable: false},
                ganalytics: {enable: false},
                openTracking: {enable: false},
                subscriptionTracking: {enable: false},
            },
            to: this.to, // Change to your recipient
            from: this.from, // Change to your verified sender
            subject: this.subject,
            text: this.body.plainText,
            html: this.body.html,
        }

        const sendgrid = require('@sendgrid/mail');
        const SENDGRID_API_KEY = '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';

        sendgrid.setApiKey(SENDGRID_API_KEY);
        const sendgridResult = await sendgrid
            .send(msg);

        console.log(JSON.stringify(Object.keys(sendgridResult), null, 2));
        console.log(JSON.stringify(sendgridResult, null, 2));
        return sendgridResult.statusCode === 202;
    }
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
    mailerType: "ses" | "sendgrid",
    to: string,
    confirmationLink: string,
}) {
    let mailer: Mailer;

    switch (config.mailerType) {
        case "ses":
            mailer = new SesMailer(
                'no-reply@okay.money',
                config.to,
                getSubject(),
                {
                    plainText: getBody("plaintext", config.confirmationLink),
                    html: getBody("html", config.confirmationLink),
                }
            );
            break;
        case "sendgrid":
            mailer = new SendGridMailer(
                getFromEmail(),
                config.to,
                getSubject(),
                {
                    plainText: getBody("plaintext", config.confirmationLink),
                    html: getBody("html", config.confirmationLink),
                }
            );
            break;
        default:
            throw new Error(`Invalid mailer type ${config.mailerType}. Can not send email`);
    }


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
                expires: new Date().getTime() + 3600 * 24 * 7,
            }),
        }).promise();

        try {
            const confirmationLink = `${getBaseUrl(event)}/register?token=${uuid}`;
            console.log(confirmationLink);
            await sendEmail({
                mailerType: "ses",
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
    } catch (e) {
        return {
            statusCode: 500,
            body: e.toString(),
        }
    }
}).create();
