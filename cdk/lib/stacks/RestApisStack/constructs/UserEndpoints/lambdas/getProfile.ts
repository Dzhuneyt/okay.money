import {DynamoDB, SSM} from 'aws-sdk';
import {UserType} from 'aws-sdk/clients/cognitoidentityserviceprovider';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import AWS = require('aws-sdk');

export async function getUserByCognitoSub(sub: string, userPoolId: string): Promise<UserType | undefined> {
    const data = await (new AWS.CognitoIdentityServiceProvider()).listUsers({
        Filter: "sub = \"" + sub + "\"",
        UserPoolId: userPoolId,
    }).promise();

    if (!data.Users?.length || data.Users.length < 1) {
        return;
    }
    const user = data.Users[0];
    if (!user.Enabled) {
        return;
    }
    return user;
    // const dynamoUser = await getDynamoUser(sub);
    // return {
    //     email: user.Username as string,
    //     firstname: dynamoUser.firstname as string,
    //     lastname: dynamoUser.lastname as string,
    // };
}

export async function getDynamoUser(sub: string) {
    const dynamoUserRaw = (await new DynamoDB().getItem({
        Key: {id: {S: sub}},
        TableName: (await new SSM().getParameter({
            Name: `/personalfinance/${process.env.ENV_NAME}/table/users/name`,
            WithDecryption: true
        }).promise()).Parameter?.Value!,
    }).promise()).Item;

    if (!dynamoUserRaw) {
        throw new Error(`Can not find Dynamo user for existing Cognito user with sub: ${sub}`);
    }
    return DynamoDB.Converter.unmarshall(dynamoUserRaw);
}

export const handler = new Handler(async (event: IEvent) => {
        const userId = event.requestContext.authorizer.claims.sub;

        const user = {
            email: "",
            firstname: "",
            lastname: "",
        };

        const cognitoUser = await getUserByCognitoSub(userId, process.env.USER_POOL_ID as string);

        if (!cognitoUser) {
            return {
                statusCode: 404,
                body: "User not found",
            }
        }

        user.email = cognitoUser.Username!;

        const dynamoUser = await getDynamoUser(userId);
        if (dynamoUser.firstname) {
            user.firstname = dynamoUser.firstname;
        }
        if (dynamoUser.lastname) {
            user.lastname = dynamoUser.lastname;
        }
        return {
            statusCode: 200,
            body: JSON.stringify(user),
        }
    }
).create()
