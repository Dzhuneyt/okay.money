import * as AWS from 'aws-sdk';
import {AttributeType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import DynamoDB = require('aws-sdk/clients/dynamodb');
import {TableNames} from "../../../../../lambdas/shared/TableNames";

const dynamodb = new DynamoDB();
const cognito = new AWS.CognitoIdentityServiceProvider();

export const handler = async (event: {
    username: string,
    password: string,
}) => {

    const userPoolId = process.env.COGNITO_USERPOOL_ID as string;
    try {
        const cognitoUser = await cognito.adminCreateUser({
            UserPoolId: userPoolId,
            Username: event.username,
            TemporaryPassword: event.password,
            MessageAction: 'SUPPRESS',
        }).promise()

        await cognito.adminSetUserPassword({
            Permanent: true,
            Password: event.password,
            UserPoolId: userPoolId,
            Username: event.username,
        }).promise()

        console.log('User created in Cognito', event.username, event.password);

        const sub = cognitoUser.User?.Attributes?.find((value: AttributeType) => {
            return value.Name === 'sub';
        })?.Value;
        console.log(sub);

        await dynamodb.putItem({
            TableName: await TableNames.users(),
            Item: DynamoDB.Converter.marshall({
                ...cognitoUser.User,
                id: sub,
            }),
        }).promise()
    } catch (e) {
        console.log('Failed to create a user');
        console.log(e);
        throw e;
    }

    return {};

}
