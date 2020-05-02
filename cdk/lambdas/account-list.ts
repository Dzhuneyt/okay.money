import * as AWS from 'aws-sdk';

export const handler = async (event: any) => {
    console.log('Lambda called');
    console.log(event);

    const tableName = process.env.TABLE_NAME as string;
    const dynamodb = new AWS.DynamoDB();
    const result = await dynamodb.query({
        ExpressionAttributeValues: {
            ":author_id": {
                S: "1"
            }
        },
        KeyConditionExpression: "pk = :author_id",
        TableName: tableName,
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
