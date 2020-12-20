import * as AWS from 'aws-sdk';
import {CognitoIdentityServiceProvider, DynamoDB} from 'aws-sdk';
import {AttributeType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {v4 as uuidv4} from 'uuid';
import {IEvent} from './interfaces/IEvent';
import {Handler} from './shared/Handler';
import {TableNames} from './shared/TableNames';

async function createDefaultCategories(userId: string) {
    const tableName = await TableNames.categories();
    const dynamo = new AWS.DynamoDB();
    for (const categoryName of [
        'Other',
        'Food',
        'Clothes',
        'Entertainment',
    ]) {
        const uuid = uuidv4();
        const result = await dynamo.putItem({
            TableName: tableName,
            Item: DynamoDB.Converter.marshall({
                id: uuid,
                author_id: userId,
                title: categoryName,
            }),
        }).promise();
        if (result.$response.error) {
            throw new Error(result.$response.error.message);
        }
    }

    return true;
}

async function createDefaultAccount(userId: string) {
    const tableName = await TableNames.accounts();
    const dynamo = new AWS.DynamoDB();

    for (const account of [
        'Cash at hand',
        'Bank account',
    ]) {
        const uuid = uuidv4();
        const result = await dynamo.putItem({
            TableName: tableName,
            Item: DynamoDB.Converter.marshall({
                id: uuid,
                author_id: userId,
                title: account,
            }),
        }).promise();
        if (result.$response.error) {
            throw new Error(result.$response.error.message);
        }
    }

    return true;
}

async function userExistsInPool(username: string, userPoolId: string) {
    try {
        const oldUser = await new CognitoIdentityServiceProvider()
            .adminGetUser({
                UserPoolId: userPoolId,
                Username: username,
            }).promise();
        return !!oldUser.Username;
    } catch (e) {
        if (e.toString().includes('UserNotFoundException')) {
            return false;
        }
        throw e;
    }
}

export const handler = new Handler(async (event: IEvent) => {
    const dynamodb = new DynamoDB();
    const cognito = new AWS.CognitoIdentityServiceProvider();

    if (!process.env.COGNITO_USERPOOL_ID) {
        return {
            statusCode: 500,
            body: "Invalid configuration"
        };
    }

    const userPoolId = process.env.COGNITO_USERPOOL_ID as string;
    try {
        const body: {
            username?: string,
            password?: string,
        } = event.body ? JSON.parse(event.body) : {};

        if (!body.username || !body.password) {
            throw new Error(`Username or Password not provided`);
        }

        if (body.password.length < 6) {
            throw new Error(`Password must be longer than 6 characters`);
        }

        const exists = await userExistsInPool(body.username, userPoolId);

        if (exists) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'User already exists',
                })
            }
        }

        const cognitoUserCreated = await cognito.adminCreateUser({
            UserPoolId: userPoolId,
            Username: body.username,
            TemporaryPassword: body.password,
            MessageAction: 'SUPPRESS',
        }).promise();

        const cognitoChangePassword = await cognito.adminSetUserPassword({
            Permanent: true,
            Username: body.username,
            Password: body.password,
            UserPoolId: userPoolId,
        }).promise();

        if (!cognitoUserCreated.User?.Username || cognitoChangePassword.$response.error) {
            console.error(cognitoUserCreated.$response);
            console.error(cognitoChangePassword.$response);
            throw new Error(`Can not create Cognito user`);
        }

        console.log('User created in Cognito', body);

        const sub = cognitoUserCreated.User
            ?.Attributes
            ?.find((value: AttributeType) => {
                return value.Name === 'sub';
            })?.Value;

        if (!sub) {
            throw new Error(`Failed to create Cognito user`);
        }
        console.log('sub', sub);

        await dynamodb.putItem({
            TableName: await TableNames.users(),
            Item: DynamoDB.Converter.marshall({
                ...cognitoUserCreated.User,
                id: sub,
            }),
        }).promise();

        // Create default things for this newly created user
        await createDefaultCategories(sub);
        await createDefaultAccount(sub);

        return {
            statusCode: 200,
            body: JSON.stringify({
                id: sub,
            })
        }
    } catch (e) {
        console.log('Failed to create a user');
        console.log(e);
        return {
            statusCode: 500,
            body: e.toString(),
        }
    }
}).create();
