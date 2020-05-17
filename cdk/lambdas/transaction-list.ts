import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

export const originalHandler = async (event: any) => {
    try {
        const userId = event.requestContext.authorizer.sub;
        const items = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list();

        return {
            statusCode: 200,
            body: JSON.stringify(items),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
