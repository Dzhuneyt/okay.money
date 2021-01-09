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

export async function userExistsInPool(username: string, userPoolId: string) {
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

async function getTokenItem(token: string) {
    try {
        const Item = await new DynamoDB().getItem({
            TableName: process.env.TABLE_NAME_TOKENS as string,
            Key: DynamoDB.Converter.marshall({
                id: token,
            }),
            ConsistentRead: true,
        }).promise();
        console.log(Item);
        return Item.Item ? DynamoDB.Converter.unmarshall(Item.Item) as {
            email: string,
        } : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export const handler = new Handler(async (event: IEvent) => {
    const dynamodb = new DynamoDB();
    const cognito = new AWS.CognitoIdentityServiceProvider();

    if (!process.env.COGNITO_USERPOOL_ID) {
        return {
            statusCode: 500,
            body: "Invalid configuration of environment variables"
        };
    }

    const userPoolId = process.env.COGNITO_USERPOOL_ID as string;
    try {
        const body: {
            token: string,
            password: string,
        } = event.body ? JSON.parse(event.body) : {};

        if (!body.token) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Token not provided',
                }),
            };
        }

        console.log('body', body);
        const tokenItem = await getTokenItem(body.token);

        if (!tokenItem) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: 'Invalid registration attempt. Link expired?',
                })
            };
        }

        // Mark the link as consumed
        await new DynamoDB().deleteItem({
            TableName: process.env.TABLE_NAME_TOKENS as string,
            Key: DynamoDB.Converter.marshall({id: body.token}),
        }).promise()

        const username = tokenItem.email;
        const password = body.password;

        if (!password || password.length < 6) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: `Password must be longer than 6 characters`,
                })
            }
        }

        const exists = await userExistsInPool(username, userPoolId);

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
            Username: username,
            TemporaryPassword: password,
            MessageAction: 'SUPPRESS',
        }).promise();

        const cognitoChangePassword = await cognito.adminSetUserPassword({
            Permanent: true,
            Username: username,
            Password: password,
            UserPoolId: userPoolId,
        }).promise();

        if (!cognitoUserCreated.User?.Username || cognitoChangePassword.$response.error) {
            console.error(cognitoUserCreated.$response);
            console.error(cognitoChangePassword.$response);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Can not create Cognito user due to an internal error`,
                })
            }
        }

        console.log('User created in Cognito', body);

        const sub = cognitoUserCreated.User
            ?.Attributes
            ?.find((value: AttributeType) => {
                return value.Name === 'sub';
            })?.Value;

        if (!sub) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Failed to extract user ID due to an internal error`,
                })
            }
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
            body: JSON.stringify({message: e.toString()}),
        }
    }
}).create();
