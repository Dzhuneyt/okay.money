import * as AWS from 'aws-sdk';
import {CognitoIdentityServiceProvider, DynamoDB} from 'aws-sdk';
import {AttributeType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {v4 as uuidv4} from 'uuid';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {TableNames} from '../../../../../../lambdas/shared/TableNames';

export async function seedDataForUser(userUUID: string) {
    async function createDefaultCategories(userUUID: string) {
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
                    author_id: userUUID,
                    title: categoryName,
                }),
            }).promise();
            if (result.$response.error) {
                throw new Error(result.$response.error.message);
            }
        }

        return true;
    }

    async function createDefaultAccounts(userUUID: string) {
        const tableName = await TableNames.accounts();
        const dynamo = new AWS.DynamoDB();

        for (const account of [
            'Cash',
            'Bank account',
        ]) {
            const uuid = uuidv4();
            const result = await dynamo.putItem({
                TableName: tableName,
                Item: DynamoDB.Converter.marshall({
                    id: uuid,
                    author_id: userUUID,
                    title: account,
                }),
            }).promise();
            if (result.$response.error) {
                throw new Error(result.$response.error.message);
            }
        }

        return true;
    }

    await createDefaultAccounts(userUUID);
    await createDefaultCategories(userUUID);
}

export async function userExistsInPool(username: string, userPoolId: string) {
    try {
        const oldUser = await new CognitoIdentityServiceProvider().adminGetUser({
            UserPoolId: userPoolId,
            Username: username,
        }).promise();
        return !!oldUser.Username;
    } catch (e: any) {
        if (e.toString().includes('UserNotFoundException')) {
            return false;
        }
        throw e;
    }
}

async function getEmailFromRegistrationToken(registrationToken: string) {
    try {
        const Item = await new DynamoDB().getItem({
            TableName: process.env.TABLE_NAME_TOKENS as string,
            Key: DynamoDB.Converter.marshall({
                id: registrationToken,
            }),
            ConsistentRead: true,
        }).promise();
        return Item.Item ? DynamoDB.Converter.unmarshall(Item.Item).email as string : undefined;
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export const handler = new Handler(async (event: IEvent) => {
    const dynamodb = new DynamoDB();
    const cognito = new AWS.CognitoIdentityServiceProvider();

    const userPoolId = process.env.COGNITO_USERPOOL_ID as string;


    if (!userPoolId) {
        return {
            statusCode: 500,
            body: "Invalid configuration of environment variables"
        };
    }

    const body: {
        token: string,
        password: string,
    } = event.body ? JSON.parse(event.body) : {};

    const registrationToken = body.token;

    const email = await getEmailFromRegistrationToken(registrationToken);

    if (!email) {
        return {
            statusCode: 404,
            body: JSON.stringify({
                message: 'Invalid registration attempt. Link expired?',
            })
        };
    }

    const password = body.password;

    if (!password || password.length < 6) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Password must be longer than 6 characters`,
            })
        }
    }

    const cognitoUserCreated = await cognito.adminCreateUser({
        UserPoolId: userPoolId,
        Username: email,
        MessageAction: 'SUPPRESS',
    }).promise();

    const cognitoChangePassword = await cognito.adminSetUserPassword({
        Permanent: true,
        Username: email,
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
    await seedDataForUser(sub);

    await invalidateRegistrationToken(registrationToken);

    return {
        statusCode: 200,
        body: JSON.stringify({
            id: sub,
        })
    }
}).create();

/**
 * Mark the token as consumed, so it can't be used anymore
 */
async function invalidateRegistrationToken(registrationToken: string) {
    await new DynamoDB().deleteItem({
        TableName: process.env.TABLE_NAME_TOKENS as string,
        Key: DynamoDB.Converter.marshall({id: registrationToken}),
    }).promise()
}
