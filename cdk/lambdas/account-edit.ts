import * as AWS from 'aws-sdk';
import {IAccount} from './interfaces/IAccount';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

interface Input extends IAccount {
    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}

const originalHandler = async (event: IEvent) => {

    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const id = event.pathParameters.id;

        const params: Input = JSON.parse(event.body || '{}');

        const item = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId).getOne(id);

        if (!item) {
            throw new Error('Item not found');
        }

        const newItem = {
            ...item,
            ...params,
            id: item.id,
        }

        const tableName = process.env.TABLE_NAME as string;
        const dynamodb = new AWS.DynamoDB();
        const obj: IAccount = {
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
