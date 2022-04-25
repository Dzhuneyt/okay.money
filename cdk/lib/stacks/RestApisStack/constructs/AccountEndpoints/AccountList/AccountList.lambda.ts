import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {ITransaction} from '../../../../../../lambdas/interfaces/ITransaction';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

const getTotalBalance = (allTransactions: ITransaction[]) => {
    if (!allTransactions.length) {
        return 0;
    }
    return allTransactions.map(value => value.sum).reduce((previousValue, currentValue) => currentValue + previousValue);
};

const originalHandler = async (event: IEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;

    const allTransactions = await new DynamoManager(await TableNames.transactions())
        .forUser(userId)
        .list() as ITransaction[];

    const accounts = await new DynamoManager(await TableNames.accounts())
        .forUser(userId)
        .list();

    const total_balance: number = getTotalBalance(allTransactions);

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
}

export const handler = new Handler(originalHandler).create();
