import * as AWS from 'aws-sdk';
import {IAccount} from './interfaces/IAccount';
import {IEvent} from './interfaces/IEvent';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {v4 as uuidv4} from 'uuid';
import {Handler} from './shared/Handler';

interface Input extends ITransaction {
    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}

const originalHandler = async (event: IEvent, context: any) => {
    console.log('Lambda called', event);

    try {
        const userId = event.requestContext.authorizer.sub
        const params: Input = JSON.parse(event.body || '{}');

        [
            'sum',
            'category_id',
            'account_id'
        ].forEach((value: string | number) => {
            if (!params[value]) {
                throw new Error(`Invalid parameter "${value}"`);
            }
        });

        const tableName = process.env.TABLE_NAME as string;
        const dynamodb = new AWS.DynamoDB();
        const uuid = uuidv4();
        const obj: ITransaction = {
            ...params,
            id: uuid,
            author_id: userId
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

        const getItem = await dynamodb.getItem({
            Key: {
                id: {
                    S: uuid
                },
            },
            TableName: tableName
        }).promise();
        return {
            statusCode: 200,
            body: JSON.stringify(DynamoDB.Converter.unmarshall(getItem.Item!)),
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
