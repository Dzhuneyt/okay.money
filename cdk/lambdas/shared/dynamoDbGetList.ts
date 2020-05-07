import * as AWS from 'aws-sdk';

export const dynamoDbGetList = async (tableName: string, userId: string) => {
    if (!tableName) {
        throw new Error('Table name is not provided');
    }
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
        throw new Error(result.$response.error.message);
    }

    return !result.Items ? [] : result.Items.map(value =>
        AWS.DynamoDB.Converter.unmarshall(value)
    );
};
