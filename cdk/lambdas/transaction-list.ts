import {IAccount} from './interfaces/IAccount';
import {ITransaction} from './interfaces/ITransaction';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

export const originalHandler = async (event: any) => {

    const categories: {
        [category_id: string]: ICategory
    } = {};
    const accounts: {
        [account_id: string]: IAccount
    } = {};

    const getCategory = async (id: string, idUser: string) => {
        // Get and cache categories (to avoid duplicate lookups)
        categories[id] = categories[id] ? categories[id] : await new DynamoManager(process.env.TABLE_NAME_CATEGORIES as string)
            .forUser(idUser)
            .getOne(id) as ICategory;
        return categories[id];
    }
    const getAccount = async (id: string, idUser: string) => {
        // Get and cache accounts (to avoid duplicate lookups)
        accounts[id] = accounts[id] ? accounts[id] : await new DynamoManager(process.env.TABLE_NAME_ACCOUNTS as string)
            .forUser(idUser)
            .getOne(id) as IAccount;
        return accounts[id];
    }

    try {
        const userId = event.requestContext.authorizer.sub;
        const items = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list() as ITransaction[];

        const result: any[] = [];
        for (const item of items) {
            try {
                const category = await getCategory(item.category_id, userId);
                const account = await getAccount(item.account_id, userId);
                item.category = category;
                item.account = account;
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
