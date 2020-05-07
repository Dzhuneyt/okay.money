import * as AWS from 'aws-sdk';
import {IEvent} from './interfaces/IEvent';

export const handler = async (event: IEvent, context: any) => {
    console.log('list accounts called', event);

    const userId = event.requestContext.authorizer.claims.sub

    const tableName = process.env.TABLE_NAME as string;
    const dynamodb = new AWS.DynamoDB();
    const result = await dynamodb.query({
        ExpressionAttributeValues: {
            ":author_id": {
                S: userId,
            }
        },
        KeyConditionExpression: "author_id = :author_id",
        TableName: tableName,
        IndexName: "author_id",
    }).promise();

    if (result.$response.error) {
        return {
            statusCode: 500,
            body: result.$response.error.message,
        }
    }

    const items = !result.Items ? [] : result.Items.map(value =>
        AWS.DynamoDB.Converter.unmarshall(value)
    );
    return {
        statusCode: 200,
        body: JSON.stringify(items),
    }
}
