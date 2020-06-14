import {DynamoDB} from 'aws-sdk';
import * as AWS from 'aws-sdk';
import {AttributeType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {IEvent} from './interfaces/IEvent';
import {Handler} from './shared/Handler';

const dynamodb = new DynamoDB();
const cognito = new AWS.CognitoIdentityServiceProvider();

const actualHandler = async (event: IEvent) => {

    if (!process.env.TABLE_NAME_USERS ||
        !process.env.COGNITO_USERPOOL_ID) {
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

        const exists = (await cognito.listUsers({
            Filter: `username=\'${body.username}\'`,
            UserPoolId: userPoolId,
        }).promise()).Users?.length;
        if (exists) {
            return {
                statusCode: 400,
                body: "Username is already taken",
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

        const sub = cognitoUserCreated.User?.Attributes?.find((value: AttributeType) => {
            return value.Name === 'sub';
        })?.Value;

        if (!sub) {
            throw new Error(`Failed to create Cognito user`);
        }
        console.log(sub);

        await dynamodb.putItem({
            TableName: process.env.TABLE_NAME_USERS as string,
            Item: DynamoDB.Converter.marshall({
                ...cognitoUserCreated.User,
                id: sub,
            }),
        }).promise();

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
            body: "Internal error occurred. Please check system logs."
        }
    }
}

export const handler = new Handler(actualHandler).create();
