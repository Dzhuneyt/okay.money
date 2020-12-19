import {IEvent} from './interfaces/IEvent';
import {ITransaction} from './interfaces/ITransaction';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

const originalHandler = async (event: IEvent) => {
    console.log(JSON.stringify(event));
    try {
        const userId = event.requestContext.authorizer.sub;

        const allTransactions = await new DynamoManager(process.env.TABLE_NAME_TRANSACTIONS as string)
            .forUser(userId)
            .list() as ITransaction[];

        const accounts = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list();

        // Enrich the accounts array with the current balance,
        // calculated by aggregating all transactions for this account
        const response = accounts.map(account => {
            let balance = 0.00;
            allTransactions
                .filter(transaction => transaction.account_id === account.id)
                .forEach(transaction => {
                    balance += transaction.sum;
                });

            account.current_balance = balance;
            return account;
        });
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
}

export const handler = new Handler(originalHandler).create();
