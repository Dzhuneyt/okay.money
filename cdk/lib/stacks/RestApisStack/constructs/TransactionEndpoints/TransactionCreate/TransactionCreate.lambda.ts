import * as AWS from 'aws-sdk';
import {DynamoDB} from 'aws-sdk';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {v4 as uuidv4} from 'uuid';
import {ITransaction} from '../../../../../../lambdas/interfaces/ITransaction';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {isOwnedBy} from '../../../../../../lambdas/shared/isOwnedBy';
import {TableNames} from "../../../../../../lambdas/shared/TableNames";

interface Input extends ITransaction {
    // Since the input is unpredictable, allow any other values
    // to "checked" by the code below without causing compilation errors
    [key: string]: any,
}

const originalHandler = async (event: IEvent) => {
    console.log('Lambda called', event);

    try {
        const userId = event.requestContext.authorizer.claims.sub
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

        const tableNameAccounts = await TableNames.accounts();
        const tableNameCategories = await TableNames.categories();
        if (!await isOwnedBy(params.account_id, userId, tableNameAccounts)) {
            throw new Error('Invalid "account_id"');
        }
        if (!await isOwnedBy(params.category_id, userId, tableNameCategories)) {
            throw new Error('Invalid "category_id"');
        }

        const tableName = await TableNames.transactions();
        const dynamodb = new AWS.DynamoDB();
        const uuid = uuidv4();
        const obj: ITransaction = {
            ...params,
            id: uuid,
            author_id: userId,
            created_at: new Date().getTime(),
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
            body: JSON.stringify(e),
        }
    }
}

export const handler = new Handler(originalHandler).create();
