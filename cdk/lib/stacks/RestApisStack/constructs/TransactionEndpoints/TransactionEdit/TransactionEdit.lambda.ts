import * as AWS from 'aws-sdk';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {ITransaction} from '../../../../../../lambdas/interfaces/ITransaction';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {isOwnedBy} from '../../../../../../lambdas/shared/isOwnedBy';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

interface Input extends ITransaction {
    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}

const originalHandler = async (event: IEvent) => {
    const userId = event.requestContext.authorizer.claims.sub;
    const id = event.pathParameters.id;

    const params: Input = JSON.parse(event.body || '{}');

    [
        'sum',
        'category_id',
        'account_id'
    ].forEach((value: string | number) => {
        if (!params[value]) {
            throw new Error(`Invalid parameter "${value}"`);
        }
    });

    const tableNameAccounts = await TableNames.accounts();
    if (!await isOwnedBy(params.account_id, userId, tableNameAccounts)) {
        throw new Error('Invalid "account_id"');
    }
    const tableNameCategories = await TableNames.categories();
    if (!await isOwnedBy(params.category_id, userId, tableNameCategories)) {
        throw new Error('Invalid "category_id"');
    }

    const tableNameTransactions = await TableNames.transactions();
    const item = await new DynamoManager(tableNameTransactions)
        .forUser(userId).getOne(id);

    if (!item) {
        throw new Error('Item not found');
    }

    const newItem = {
        ...item,
        ...params,
    }

    const dynamodb = new AWS.DynamoDB();
    const obj: ITransaction = {
        ...newItem,
    };
    const putItem = await dynamodb.putItem({
        TableName: tableNameTransactions,
        Item: DynamoDB.Converter.marshall(obj),
    }).promise();

    if (putItem.$response.error) {
        return {
            statusCode: 500,
            body: putItem.$response.error.message,
        }
    }

    const refreshedItem = await new DynamoManager(tableNameTransactions)
        .forUser(userId).getOne(id);
    return {
        statusCode: 200,
        body: JSON.stringify(refreshedItem),
    }
}

export const handler = new Handler(originalHandler).create();
