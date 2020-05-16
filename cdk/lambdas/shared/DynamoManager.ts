import * as AWS from 'aws-sdk';
import DynamoDB = require('aws-sdk/clients/dynamodb');

export class DynamoManager {
    private tableName: string;
    private userId: string;
    private connection: DynamoDB;

    constructor(tableName: string) {
        this.tableName = tableName;
        this.connection = new AWS.DynamoDB();
    }

    forUser(userId: string) {
        this.userId = userId;
        return this;
    }

    async list() {
        const result = await this.connection.query({
            ExpressionAttributeValues: {
                ":author_id": {
                    S: this.userId,
                }
            },
            KeyConditionExpression: "author_id = :author_id",
            TableName: this.tableName,
            IndexName: "author_id",
        }).promise();

        if (result.$response.error) {
            throw new Error(result.$response.error.message);
        }

        return !result.Items ? [] : result.Items.map(value =>
            AWS.DynamoDB.Converter.unmarshall(value)
        );
    }

}
