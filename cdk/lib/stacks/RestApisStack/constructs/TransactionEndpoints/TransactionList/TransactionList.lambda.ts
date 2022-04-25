import {IAccount} from '../../../../../../lambdas/interfaces/IAccount';
import {ITransaction} from '../../../../../../lambdas/interfaces/ITransaction';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

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

        const tableNameCategories = await TableNames.categories();
        const categories = await new DynamoManager(tableNameCategories)
            .forUser(userId)
            .list() as ICategory[];

        const tableNameAccounts = await TableNames.accounts();
        const accounts = await new DynamoManager(tableNameAccounts)
            .forUser(userId)
            .list() as IAccount[];

        const tableNameTransactions = await TableNames.transactions();
        const transactions = await new DynamoManager(tableNameTransactions)
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
