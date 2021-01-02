import {IAccount} from './interfaces/IAccount';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

export const originalHandler = async (event: any) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const id = event.pathParameters.id;

        const item = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId).getOne(id);

        item.category = await new DynamoManager(process.env.TABLE_NAME_CATEGORIES as string)
            .forUser(userId)
            .getOne(item.category_id) as ICategory;
        item.account = await new DynamoManager(process.env.TABLE_NAME_ACCOUNTS as string)
            .forUser(userId)
            .getOne(item.account_id) as IAccount;

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
