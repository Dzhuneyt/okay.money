import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';
import {DynamoManager} from './shared/DynamoManager';
import {Handler} from './shared/Handler';

const originalHandler = async (event: IEvent) => {

    try {
        const userId = event.requestContext.authorizer.sub;
        const tableName = process.env.TABLE_NAME as string;

        const id = event.pathParameters.id;

        const item = await new DynamoManager(tableName)
            .forUser(userId).getOne(id);
        if (!item) {
            return {
                statusCode: 404,
                body: "Not found",
            }
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
            console.error(deleteResult.$response.error);
            return {
                statusCode: 500,
                body: "Internal server error",
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
