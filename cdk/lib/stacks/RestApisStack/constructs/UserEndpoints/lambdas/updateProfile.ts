import {CognitoIdentityServiceProvider, DynamoDB, SSM} from 'aws-sdk';
import {IEvent} from '../../../../../../lambdas/interfaces/IEvent';
import {Handler} from '../../../../../../lambdas/shared/Handler';
import {getDynamoUser, getUserByCognitoSub} from './getProfile';

async function changeCognitoUserPassword(Username: string, Password: string) {
    const UserPoolId = (await new SSM().getParameter({
        Name: `/personalfinance/${process.env.ENV_NAME}/pool/id`,
        WithDecryption: true,
    }).promise()).Parameter?.Value as string;
    const passwordUpdated = await new CognitoIdentityServiceProvider().adminSetUserPassword({
        Permanent: true,
        UserPoolId,
        Username,
        Password,
    }).promise();
    console.log(passwordUpdated);
    return true;
}

async function checkOldPasswordIsValid(Username: string, Password: string) {
    const userPoolClientId = (await new SSM().getParameter({
        Name: `/personalfinance/${process.env.ENV_NAME}/pool/client/id`,
        WithDecryption: true,
    }).promise()).Parameter?.Value as string;

    try {
        const result = await (new CognitoIdentityServiceProvider).initiateAuth({
            ClientId: userPoolClientId,
            AuthFlow: 'USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: Username,
                PASSWORD: Password,
            },
        }).promise();

        return !!result.AuthenticationResult;
    } catch (e) {
        console.log(e);
        return false;
    }
}

export const handler = new Handler(async (event: IEvent) => {
        console.log(event);
        const userId = event.requestContext.authorizer.claims.sub;

        const cognitoUser = await getUserByCognitoSub(userId, process.env.USER_POOL_ID as string);

        if (!cognitoUser) {
            return {
                statusCode: 404,
                body: JSON.stringify({message: "User not found"}),
            }
        }

        const parsedBody = JSON.parse(event.body as string);

        if (parsedBody.old_password && parsedBody.new_password) {
            // Change password request
            const oldPasswordCorrect = await checkOldPasswordIsValid(cognitoUser?.Username!, parsedBody.old_password);
            if (!oldPasswordCorrect) {
                return {
                    statusCode: 400,
                    body: JSON.stringify({message: "Current password is not correct"}),
                }
            }
            await changeCognitoUserPassword(cognitoUser?.Username!, parsedBody.new_password);
        }

        // Update the DynamoDB item for this user
        const dynamoUser = await getDynamoUser(userId);
        if (parsedBody.firstname) {
            dynamoUser.firstname = parsedBody.firstname;
        }
        if (parsedBody.lastname) {
            dynamoUser.lastname = parsedBody.lastname;
        }

        await (new DynamoDB()).putItem({
            TableName: (await new SSM().getParameter({
                Name: `/personalfinance/${process.env.ENV_NAME}/table/users/name`,
                WithDecryption: true
            }).promise()).Parameter?.Value!,
            Item: DynamoDB.Converter.marshall(dynamoUser),
        }).promise();


        console.log(cognitoUser);
        return {
            statusCode: 200,
            body: JSON.stringify(cognitoUser),
        }
    }
).create()
