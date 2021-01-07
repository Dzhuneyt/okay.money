import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {ITransaction} from './interfaces/ITransaction';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';
import {isOwnedBy} from './shared/isOwnedBy';

interface Input extends ITransaction {
    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}

const originalHandler = async (event: IEvent) => {

    try {
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

        if (!await isOwnedBy(params.account_id, userId, process.env.TABLE_NAME_ACCOUNTS as string)) {
            throw new Error('Invalid "account_id"');
        }
        if (!await isOwnedBy(params.category_id, userId, process.env.TABLE_NAME_CATEGORIES as string)) {
            throw new Error('Invalid "category_id"');
        }

        const item = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId).getOne(id);

        if (!item) {
            throw new Error('Item not found');
        }

        const newItem = {
            ...item,
            ...params,
        }

        const tableName = process.env.TABLE_NAME as string;
        const dynamodb = new AWS.DynamoDB();
        const obj: ITransaction = {
            ...newItem,
        };
        const putItem = await dynamodb.putItem({
            TableName: tableName,
            Item: DynamoDB.Converter.marshall(obj),
        }).promise();

        if (putItem.$response.error) {
            return {
                statusCode: 500,
                body: putItem.$response.error.message,
            }
        }

        const refreshedItem = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId).getOne(id);
        return {
            statusCode: 200,
            body: JSON.stringify(refreshedItem),
        }
    } catch (e) {
        console.log(e);
        return {
            statusCode: 500,
            body: e.toString()
        }
    }
}

export const handler = new Handler(originalHandler).create();
