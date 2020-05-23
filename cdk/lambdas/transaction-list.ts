import {IAccount} from './interfaces/IAccount';
import {ITransaction} from './interfaces/ITransaction';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

export const originalHandler = async (event: any) => {
    try {
        const userId = event.requestContext.authorizer.sub;
        const items = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list() as ITransaction[];

        const categories: {
            [category_id: string]: ICategory
        } = {};
        const accounts: {
            [account_id: string]: IAccount
        } = {};

        const result: any[] = [];
        for (const item of items) {

            // Get and cache categories (to avoid duplicate lookups)
            categories[item.category_id] = categories[item.category_id] ? categories[item.category_id] : await new DynamoManager(process.env.TABLE_NAME_CATEGORIES as string)
                .forUser(userId)
                .getOne(item.category_id) as ICategory;
            // Get and cache accounts (to avoid duplicate lookups)
            accounts[item.account_id] = accounts[item.account_id] ? accounts[item.account_id] : await new DynamoManager(process.env.TABLE_NAME_ACCOUNTS as string)
                .forUser(userId)
                .getOne(item.account_id) as IAccount;

            item.category = categories[item.category_id];
            item.account = accounts[item.account_id];
            result.push(item);
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
