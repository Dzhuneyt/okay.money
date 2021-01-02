import {IAccount} from './interfaces/IAccount';
import {ITransaction} from './interfaces/ITransaction';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

const findById = (collection: { id?: string }[], id: string) => {
    const found = collection.find(cat => cat.id === id);
    if (!found) {
        throw new Error(`Can not find element with ID ${id}`);
    }
    return found;
}

export const originalHandler = async (event: any) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;

        const categories = await new DynamoManager(process.env.TABLE_NAME_CATEGORIES as string)
            .forUser(userId)
            .list() as ICategory[];

        const accounts = await new DynamoManager(process.env.TABLE_NAME_ACCOUNTS as string)
            .forUser(userId)
            .list() as IAccount[];

        const transactions = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list() as ITransaction[];

        const result: ITransaction[] = [];

        for (const item of transactions) {
            try {
                item.category = findById(categories, item.category_id);
                item.account = findById(accounts, item.account_id);
                result.push(item);
            } catch (e) {
                console.error(e);
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
