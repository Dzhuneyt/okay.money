import * as AWS from 'aws-sdk';

export class DynamoManager {
    private tableName: string;
    private userId: string;
    private connection: AWS.DynamoDB;

    constructor(tableName: string) {
        this.tableName = tableName;
        this.connection = new AWS.DynamoDB();
    }

    forUser(userId: string) {
        this.userId = userId;
        return this;
    }

    async list() {

        if (!this.userId) {
            throw new Error(`userId not provided for listing`);
        }
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

    async getOne(id: string) {
        if (!this.userId) {
            throw new Error(`userId not provided for getOne`);
        }
        const item = await this.connection.getItem({
            Key: {
                "id": {
                    S: id,
                }
            },
            TableName: this.tableName,
        }).promise();

        if (item.$response.error) {
            throw new Error(item.$response.error.message);
        }

        if (!item.Item) {
            throw new Error(`Item not found: ${id}`);
        }
        const result = AWS.DynamoDB.Converter.unmarshall(item.Item);
        if (result.author_id !== this.userId) {
            throw new Error(`Item not found: ${id}`);
        }
        return result;
    }

}
