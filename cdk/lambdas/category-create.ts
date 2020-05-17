import * as AWS from 'aws-sdk';
import {IsNotEmpty, Length} from 'class-validator';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {v4 as uuidv4} from 'uuid';
import {Handler} from './shared/Handler';

interface Input {
    title: string,
}

const originalHandler = async (event: IEvent) => {
    try {
        const userId = event.requestContext.authorizer.sub
        const params: Input = JSON.parse(event.body || '{}');

        if (!params['title']) {
            return {
                statusCode: 400,
                body: `Invalid "title" parameter`,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "*",
                    "Access-Control-Allow-Methods": "*",
                    'Access-Control-Allow-Credentials': true,
                },
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
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*",
                'Access-Control-Allow-Credentials': true,
            },
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: JSON.stringify(e),
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Methods": "*",
                'Access-Control-Allow-Credentials': true,
            },
        }
    }
}

export const handler = new Handler(originalHandler)
    .create();
