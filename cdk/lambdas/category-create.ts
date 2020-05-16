import * as AWS from 'aws-sdk';
import {IsNotEmpty, Length} from 'class-validator';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {v4 as uuidv4} from 'uuid';

interface Input {
    title: string,
}

export const handler = async (event: IEvent) => {
    try {
        const userId = event.requestContext.authorizer.claims.sub
        const params: Input = JSON.parse(event.body || '{}');

        if (!params['title']) {
            return {
                statusCode: 400,
                body: `Invalid "title" parameter`
            }
        }

        const tableName = process.env.TABLE_NAME as string;
        const dynamodb = new AWS.DynamoDB();
        const uuid = uuidv4();
        const result = await dynamodb.putItem({
            TableName: tableName,
            Item: DynamoDB.Converter.marshall({
                id: uuid,
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

        const item = await dynamodb.getItem({
            Key: {
                id: {
                    S: uuid
                },
            },
            TableName: tableName
        }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(DynamoDB.Converter.unmarshall(item.Item!)),
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
        }
    }
}
