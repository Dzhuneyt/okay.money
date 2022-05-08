import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {ITransaction} from '../../../../../../lambdas/interfaces/ITransaction';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from '../../../../../../lambdas/shared/TableNames';

const organizeTransactionsUnderCategories = async (transactions: ITransaction[], userId: string) => {
    const tableNameCategories = await TableNames.categories();
    const allCategories = await new DynamoManager(tableNameCategories)
        .forUser(userId)
        .list();

    return allCategories
        // Filter categories only to those that have at least one transaction
        .filter(cat => !!transactions.find(transaction => transaction.category_id == cat.id))
        .map(category => {
            const transactionsForThisCategory = transactions.filter(transaction => transaction.category_id === category.id);
            let income_for_period = 0;
            transactionsForThisCategory
                .filter(transaction => transaction.sum > 0)
                .map(tr => {
                    income_for_period += tr.sum;
                });

            let expense_for_period = 0;
            transactionsForThisCategory
                .filter(tr => {
                    return tr.category_id == category.id && tr.sum < 0;
                }).map(tr => {
                expense_for_period += tr.sum;
            });

            const difference_for_period = income_for_period + expense_for_period;

            return {
                id: category.id,
                name: category.title,
                income_for_period,
                expense_for_period,
                difference_for_period,
            };
        });
};

export const handler = new Handler(async (event: IEvent) => {

    try {
        const userId = event.requestContext.authorizer.claims.sub;

        const allTransactions = await new DynamoManager(await TableNames.transactions())
            .forUser(userId)
            .list() as ITransaction[];

        const response = await organizeTransactionsUnderCategories(allTransactions, userId);

        return {
            statusCode: 200,
            body: JSON.stringify(response),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}).create();
