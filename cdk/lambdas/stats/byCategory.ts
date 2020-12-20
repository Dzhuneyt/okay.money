import {IEvent} from '../interfaces/IEvent';
import {ITransaction} from '../interfaces/ITransaction';
import {DynamoManager} from '../shared/DynamoManager';
import {Handler} from '../shared/Handler';
import {TableNames} from '../shared/TableNames';

interface Input {
    start_date: number;
    end_date: number;
}

class StatsByCategory {
    private categories: any[];

    constructor(private userId: string) {
    }

    async getCategories() {
        if (this.categories === undefined) {
            this.categories = await new DynamoManager(await TableNames.categories())
                .forUser(this.userId)
                .list();
        }
        return this.categories;
    }
}

const organizeTransactionsUnderCategories = async (transactions: ITransaction[], userId: string) => {
    const allCategories = await new DynamoManager(await TableNames.categories())
        .forUser(userId)
        .list();

    const filteredCategories = allCategories
        // Filter categories only to those that have at least one transaction
        .filter(cat => !!transactions.find(transaction => transaction.category_id == cat.id));

    return filteredCategories.map(cat => {
        let income_for_period = 0;
        transactions.filter(tr => {
            return tr.category_id == cat.id && tr.sum > 0;
        }).map(tr => {
            income_for_period += tr.sum;
        });

        let expense_for_period = 0;
        transactions.filter(tr => {
            return tr.category_id == cat.id && tr.sum < 0;
        }).map(tr => {
            expense_for_period += tr.sum;
        });

        return {
            id: cat.id,
            name: cat.title,
            income_for_period,
            expense_for_period,
            difference_for_period: income_for_period + expense_for_period,
        };
    });
};

export const handler = new Handler(async (event: IEvent) => {

    try {
        const userId = event.requestContext.authorizer.sub;

        const allTransactions = await new DynamoManager(await TableNames.transactions())
            .forUser(userId)
            .list() as ITransaction[];
        console.log('transactions count', allTransactions.length);

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
