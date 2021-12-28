import {IEvent} from './interfaces/IEvent';
import {ITransaction} from './interfaces/ITransaction';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

function getTotalBalance(allTransactions: ITransaction[]) {
    if (!allTransactions.length) {
        return 0;
    }
    return allTransactions.map(value => value.sum).reduce((previousValue, currentValue) => currentValue + previousValue);
}

const originalHandler = async (event: IEvent) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;

        const allTransactions = await new DynamoManager(process.env.TABLE_NAME_TRANSACTIONS as string)
            .forUser(userId)
            .list() as ITransaction[];

        const accounts = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list();

        const total_balance: number = getTotalBalance(allTransactions);

        console.log(total_balance);
        // Enrich the accounts array with the current balance,
        // calculated by aggregating all transactions for this account
        const response = {
            accounts: accounts.map(account => {
                let balance = 0.00;
                allTransactions
                    .filter(transaction => transaction.account_id === account.id)
                    .forEach(transaction => {
                        balance += transaction.sum;
                    });

                account.current_balance = balance;
                return account;
            }),
            total_balance,
        };
        return {
            statusCode: 200,
            body: JSON.stringify(response),
        }
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
