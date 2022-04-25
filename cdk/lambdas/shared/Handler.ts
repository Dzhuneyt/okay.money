export class Handler {
    private readonly handler: Function;

    constructor(handler: Function) {
        this.handler = handler;
    }

    create() {
        return async (event: any, context: any) => {
            try {
                const innerResult = await this.handler(event, context);
                if (!innerResult.headers) {
                    innerResult.headers = {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Methods": "*",
                        'Access-Control-Allow-Credentials': true,
                    }
                }
                return innerResult;
            } catch (e) {
                console.error(e);
                return {
                    statusCode: 500,
                    body: process.env.ENV_NAME === 'master' ? 'Internal server error' : JSON.stringify(e),
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Allow-Methods": "*",
                        'Access-Control-Allow-Credentials': true,
                    }
                }
            }

        }
    }
}
