import {Mailer} from "./mailer";
import * as nodemailer from "nodemailer";

export class SendinblueMailer extends Mailer {
    async send(): Promise<boolean> {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
            host: "smtp-relay.sendinblue.com",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: 'jix2mail@gmail.com', // generated ethereal user
                pass: 'xsmtpsib-0624776024cad6a02a6d188a99551cf3868de284b5ca3a4ccb9b94ddc6b35221-GpqjMhw8RQ7Ex3Sb',
            },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
            from: this.from, // sender address
            to: this.to, // list of receivers
            subject: this.subject, // Subject line
            text: this.body.plainText, // plain text body
            html: this.body.html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        return true;
    }

}
