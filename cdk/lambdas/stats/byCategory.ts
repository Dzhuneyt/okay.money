import {IEvent} from '../interfaces/IEvent';
import {ITransaction} from '../interfaces/ITransaction';
import {DynamoManager} from '../shared/DynamoManager';
import {Handler} from '../shared/Handler';
import {TableNames} from '../shared/TableNames';

interface Input {
    start_date: number;
    end_date: number;
}

async function organizeTransactionsUnderCategories(transactions: ITransaction[], userId: string) {
    const allCategories = await new DynamoManager(await TableNames.categories())
        .forUser(userId)
        .list()

    const filteredCategories = allCategories
        .filter(cat => {
            // Filter categories only to those that have at least one transaction
            return transactions.find(trans => trans.category_id === cat.id);
        });

    return filteredCategories.map(cat => {
        return {
            id: cat.id,
            name: cat.title,
            income_for_period: 13,
            expense_for_period: -25,
            difference_for_period: 13 + -25,
        };
    });
}

export const handler = new Handler(async (event: IEvent) => {

    try {
        const params: Input = JSON.parse(event.body || '{}');
        const userId = event.requestContext.authorizer.sub;

        const allTransactions = await new DynamoManager(await TableNames.accounts())
            .forUser(userId)
            .list() as ITransaction[];

        const response = organizeTransactionsUnderCategories(allTransactions, userId);

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

    //
    // const response = {
    //     'categories': [
    //         {
    //             id: "123",
    //             name: "Bla",
    //             income_for_period: 13,
    //             expense_for_period: -25,
    //             difference_for_period: 13 + -25,
    //         },
    //         {
    //             id: "124",
    //             name: "Bla2",
    //             income_for_period: 1,
    //             expense_for_period: -10,
    //             difference_for_period: -9,
    //         }
    //     ]
    // }
    // return {
    //     statusCode: 200,
    //     body: JSON.stringify(response)
    // }
}).create();
