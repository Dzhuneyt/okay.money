import * as AWS from 'aws-sdk';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {DynamoManager} from '../../../../../../lambdas/shared/DynamoManager';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

interface CategoryEditInput {
    title: string,
}

const originalHandler = async (event: IEvent) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub;
        const id = event.pathParameters.id;

        const categoryEditInput = JSON.parse(event.body || '{}') as CategoryEditInput;

        const tableName = await TableNames.categories();

        const originalItem = await new DynamoManager(tableName)
            .forUser(userId).getOne(id);

        if (!originalItem) {
            throw new Error('Item not found');
        }

        const newItem = {
            ...originalItem,
            title: categoryEditInput.title,
        }

        const putItem = await new AWS.DynamoDB()
            .putItem({
                TableName: tableName,
                Item: DynamoDB.Converter.marshall(newItem),
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
