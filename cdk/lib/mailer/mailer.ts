export abstract class Mailer {
    constructor(
        protected from: string,
        protected to: string,
        protected subject: string,
        protected body: { plainText: string, html: string }
    ) {
    }

    abstract send(): Promise<boolean>;
}
