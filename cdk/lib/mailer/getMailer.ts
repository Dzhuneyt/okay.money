import {SesMailer} from "./SesMailer";
import {SendinblueMailer} from "./SendinblueMailer";

export function getMailer(props: {
    to: string,
    subject: string,
    body: {
        html: string,
        text: string,
    },
}) {
    if (process.env.ENV_NAME === 'master') {
        return new SesMailer('no-reply@okay.money',
            props.to,
            props.subject,
            {
                plainText: props.body.text,
                html: props.body.html,
            });
    }
    return new SendinblueMailer(
        'jix2mail@gmail.com',
        props.to,
        props.subject,
        {
            plainText: props.body.text,
            html: props.body.html,
        }
    );
}
