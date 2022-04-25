import {IEvent} from './interfaces/IEvent';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

const originalHandler = async (event: IEvent) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const id = event.pathParameters.id;

        const item = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .getOne(id);
        return {
            statusCode: 200,
            body: JSON.stringify(item),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
