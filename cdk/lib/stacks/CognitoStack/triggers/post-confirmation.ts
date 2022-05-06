import {PostConfirmationTriggerHandler} from "aws-lambda";
import {SES} from "aws-sdk";
import {seedDataForUser} from "../../RestApisStack/constructs/AuthEndpoints/lambdas/registerConfirm";

async function sendWelcomeEmail(email: string) {
    const postRegistration = {
        title: "Welcome to Okay.Money",
        body: {
            text: "You have registered",
            html: `You have registered`,
        }
    }
    return await new SES().sendEmail({
        Destination: {
            ToAddresses: [email]
        },
        Source: 'no-reply@okay.money',
        Message: {
            Body: {
                Html: {Data: postRegistration.body.html},
                Text: {Data: postRegistration.body.text}
            },
            Subject: {Data: postRegistration.title}
        },
    }).promise();
}

export const handler: PostConfirmationTriggerHandler = async (event) => {
    const sub = event.request.userAttributes.sub; // e.g. 12345678-1234-1234-1234-12345678
    const email = event.request.userAttributes.email; // e.g. example@example.com
    const username = event.userName; // e.g. Google_1111111111111111

    // const emailResult = await sendWelcomeEmail(email);
    // console.log('SES email result', JSON.stringify(emailResult, null, 2));

    await seedDataForUser(sub);

    console.log('Post confirmation lambda called', {
        sub, email, username,
    });
    return event;
}
