import {IAccount} from '../../../../../../lambdas/interfaces/IAccount';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

export const originalHandler = async (event: any) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const id = event.pathParameters.id;

        const tableNameTransactions = await TableNames.transactions();
        const item = await new DynamoManager(tableNameTransactions)
            .forUser(userId).getOne(id);

        const tableNameCategories = await TableNames.categories();
        item.category = await new DynamoManager(tableNameCategories)
            .forUser(userId)
            .getOne(item.category_id) as ICategory;

        const tableNameAccounts = await TableNames.accounts();
        item.account = await new DynamoManager(tableNameAccounts)
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
