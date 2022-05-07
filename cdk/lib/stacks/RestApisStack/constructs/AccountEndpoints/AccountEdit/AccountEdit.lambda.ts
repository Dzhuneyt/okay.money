import * as AWS from 'aws-sdk';
import {IAccount} from '../../../../../../lambdas/interfaces/IAccount';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

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

        const tableName = await TableNames.accounts();
        const item = await new DynamoManager(tableName)
            .forUser(userId).getOne(id);

        if (!item) {
            throw new Error('Item not found');
        }

        const newItem = {
            ...item,
            ...params,
            id: item.id,
        }

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

        const refreshedItem = await new DynamoManager(tableName)
            .forUser(userId).getOne(id);
        return {
            statusCode: 200,
            body: JSON.stringify(refreshedItem),
        }
    } catch (e: any) {
        console.log(e);
        return {
            statusCode: 500,
            body: e.toString()
        }
    }
}

export const handler = new Handler(originalHandler).create();
