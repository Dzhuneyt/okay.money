import {Mailer} from "./mailer";
import {SES} from "aws-sdk";

export class SesMailer extends Mailer {
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
