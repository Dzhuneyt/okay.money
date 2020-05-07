import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {v4 as uuidv4} from 'uuid';

interface Input {
    title: string,
}

export const handler = async (event: IEvent, context: any) => {
    console.log('Lambda called', event);

    const userId = event.requestContext.authorizer.claims.sub
    const params: Input = JSON.parse(event.body);

    if (!params.title) {
        return {
            statusCode: 400,
            body: `Invalid "title" parameter`
        }
    }

    const tableName = process.env.TABLE_NAME as string;
    const dynamodb = new AWS.DynamoDB();
    const result = await dynamodb.putItem({
        TableName: tableName,
        Item: DynamoDB.Converter.marshall({
            id: uuidv4(),
            author_id: userId,
            title: params.title,
        }),
    }).promise();

    if (result.$response.error) {
        return {
            statusCode: 500,
            body: result.$response.error.message,
        }
    }

    return {
        statusCode: 200,
        body: JSON.stringify(result.$response.data),
    }
}
