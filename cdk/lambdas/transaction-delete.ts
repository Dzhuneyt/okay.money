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
        const tableName = process.env.TABLE_NAME as string;

        const id = event.pathParameters.id;

        const item = await new DynamoManager(tableName)
            .forUser(userId).getOne(id);
        if (!item) {
            throw new Error('Item not found');
        }
        const dynamodb = new AWS.DynamoDB();
        const deleteResult = await dynamodb.deleteItem({
            TableName: tableName,
            Key: {
                id: {
                    S: id,
                }
            }
        }).promise();

        if (deleteResult.$response.error) {
            return {
                statusCode: 500,
                body: deleteResult.$response.error.message,
            }
        }
        return {
            statusCode: 200,
            body: JSON.stringify(item),
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
