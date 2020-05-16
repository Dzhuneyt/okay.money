import {IEvent} from './interfaces/IEvent';
import {DynamoManager} from './shared/DynamoManager';

export const handler = async (event: IEvent, context: any) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
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
