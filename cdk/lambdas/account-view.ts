import {IEvent} from './interfaces/IEvent';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';
import DynamoDB = require('aws-sdk/clients/dynamodb');

async function getDynamoRow(id: string, authorId: string) {
    const dynamo = new DynamoDB();
    if (!id) {
        throw new Error('Item not found');
    }
    const item = await dynamo.getItem({
        Key: {
            id: {
                S: id,
            }
        },
        TableName: process.env.TABLE_NAME as string
    }).promise();
    if (!item.Item) {
        throw new Error('Item not found');
    }
    if (item.Item.author_id.S !== authorId) {
        console.error(`Item with ID ${id} is not owned by ${authorId}`);
        throw new Error('Item not found');
    }
    return DynamoDB.Converter.unmarshall(item.Item);
}

const originalHandler = async (event: IEvent) => {
    console.log(JSON.stringify(event));
    return {
        statusCode: 200,
        body: JSON.stringify({'view item': true}),
    }
    try {
        const userId = event.requestContext.authorizer.sub;
        const accountId = event.pathParameters.account_id;

        const row = getDynamoRow(accountId, userId);

        console.log(userId);
        const items = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId)
            .list();

        return {
            statusCode: 200,
            body: JSON.stringify(items),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
