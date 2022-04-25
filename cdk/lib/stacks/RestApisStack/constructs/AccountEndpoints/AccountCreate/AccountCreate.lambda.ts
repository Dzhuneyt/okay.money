import * as AWS from 'aws-sdk';
import * as DynamoDB from 'aws-sdk/clients/dynamodb';
import {v4 as uuidv4} from 'uuid';
import {IAccount} from '../../../../../../lambdas/interfaces/IAccount';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

interface Input {
    title: string,
}

const originalHandler = async (event: IEvent) => {
    const userId = event.requestContext.authorizer.claims.sub
    const params: Input = JSON.parse(event.body || '{}');

    if (!params.title) {
        return {
            statusCode: 400,
            body: `Invalid "title" parameter`
        }
    }

    const tableName = await TableNames.accounts();
    const dynamodb = new AWS.DynamoDB();
    const uuid = uuidv4();
    const account: IAccount = {
        id: uuid,
        author_id: userId,
        title: params.title,
        created_at: new Date().getTime(),
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
}
export const handler = new Handler(originalHandler).create();
