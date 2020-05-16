import * as AWS from 'aws-sdk';
import {IAccount} from './interfaces/IAccount';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {v4 as uuidv4} from 'uuid';

interface Input {
    title: string,
    account_id: string,
    category_id: string,
}

export const handler = async (event: IEvent, context: any) => {
    console.log('Lambda called', event);

    try {
        const userId = event.requestContext.authorizer.claims.sub
        const params: Input = JSON.parse(event.body || '{}');

        [
            'title',
            'category_id',
            'account_id',
        ].forEach((requiredParam: string) => {
            // @ts-ignore
            if (!params[requiredParam]) {
                throw new Error(`Invalid parameter ${requiredParam}`);
            }
        })

        const tableName = process.env.TABLE_NAME as string;
        const dynamodb = new AWS.DynamoDB();
        const uuid = uuidv4();
        const account: IAccount = {
            id: uuid,
            author_id: userId,
            title: params.title,
        };
        const result = await dynamodb.putItem({
            TableName: tableName,
            Item: DynamoDB.Converter.marshall(account),
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
