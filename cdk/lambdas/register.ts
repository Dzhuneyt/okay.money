import {IEvent} from './interfaces/IEvent';
import {Handler} from './shared/Handler';
import {v4} from 'uuid';
import {DynamoDB} from "aws-sdk";
import {MailDataRequired} from "@sendgrid/helpers/classes/mail";
import {userExistsInPool} from "./registerConfirm";

const sendgrid = require('@sendgrid/mail');
const SENDGRID_API_KEY = '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';

sendgrid.setApiKey(SENDGRID_API_KEY);

function getBaseUrl() {
    switch (process.env.ENV_NAME) {
        case 'master':
            return 'https://okay.money';
        default:
            return 'http://localhost:3000';
    }
}

async function emailRegistered(email: string) {
    return await userExistsInPool(email, process.env.COGNITO_USERPOOL_ID as string);
}

export const handler = new Handler(async (event: IEvent) => {
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


        const link = getBaseUrl() + `/register?token=${uuid}`;

        const msg: MailDataRequired = {
            // Prevent emails from ending up in spam, by disabling link cloaking
            // and embedding a pixel image inside email HTML
            trackingSettings: {
                clickTracking: {enable: false},
                ganalytics: {enable: false},
                openTracking: {enable: false},
                subscriptionTracking: {enable: false},
            },
            to: body.email, // Change to your recipient
            from: 'no-reply-registration@em5577.dzhuneyt.com', // Change to your verified sender
            subject: 'Registration confirmation',
            text: `Please visit this link to confirm your email: \n${link}\n\nNote that the link expires in 7 days.`,
            html: `Please <a href="${link}">click here</a> to confirm your email. The link will expire in 7 days.`,
        }
        const emailResult = await sendgrid
            .send(msg);

        console.log(emailResult);

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
