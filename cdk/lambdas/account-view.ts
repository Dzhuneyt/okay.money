import {IEvent} from './interfaces/IEvent';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';
import DynamoDB = require('aws-sdk/clients/dynamodb');

const originalHandler = async (event: IEvent) => {
    console.log(event);
    try {
        const userId = event.requestContext.authorizer.sub;
        const accountId = event.pathParameters.id;
        console.log(accountId);

        const item = await new DynamoManager(process.env.TABLE_NAME as string)
            .forUser(userId).getOne(accountId);
        console.log(item);
        return {
            statusCode: 200,
            body: JSON.stringify(item),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
