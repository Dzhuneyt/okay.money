import {PostConfirmationTriggerHandler} from "aws-lambda";
import {seedDataForUser} from "../../RestApisStack/constructs/AuthEndpoints/lambdas/registerConfirm";
import {getMailer} from "../../../mailer/getMailer";

async function sendWelcomeEmail(email: string) {
    const mailer = await getMailer({
        to: email,
        subject: 'Welcome to okay.money!',
        body: {
            html: `<p>Hello!</p>` +
                `<p>As the founder of okay.money I would like to thank you for joining the platform!</p>` +
                `<p>Should you have any questions or feedback, don't hesitate to reach out to me at contact@okay.money</p>` +
                `<p>Cheers! Dzhuneyt</p>`,
            text: `Hello!\n` +
                `As the founder of okay.money I would like to thank you for joining the platform!\n` +
                `Should you have any questions or feedback, don't hesitate to reach out to me at contact@okay.money\n` +
                `Cheers! Dzhuneyt`,
        }
    })

    const emailResult = await mailer.send();

    console.log(emailResult);
    return emailResult;
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
    const sub = event.request.userAttributes.sub; // e.g. 12345678-1234-1234-1234-12345678
    const email = event.request.userAttributes.email; // e.g. example@example.com
    const username = event.userName; // e.g. Google_1111111111111111

    await seedDataForUser(sub);

    const emailResult = await sendWelcomeEmail(email);
    console.log('SES email result', JSON.stringify(emailResult, null, 2));

    console.log('Post confirmation lambda called', {sub, email, username});
    return event;
}
