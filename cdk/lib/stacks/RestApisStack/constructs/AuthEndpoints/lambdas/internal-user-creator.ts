import {AttributeType} from "aws-sdk/clients/cognitoidentityserviceprovider";
import {CognitoIdentityServiceProvider, DynamoDB} from "aws-sdk";
import {TableNames} from "../../../../../../lambdas/shared/TableNames";
import {seedDataForUser} from "./registerConfirm";

export const handler = async (event: {
    email: string,
    password: string,
}) => {
    if (!event.email || !event.password) {
        throw new Error(`Lambda invocation requires an event with the following structure: {email: "example@example.com", password: "Pa$$w0rd!123"}`);
    }

    const email = event.email;
    const password = event.password;
    const userPoolId = process.env.COGNITO_USERPOOL_ID as string;

    const cognito = new CognitoIdentityServiceProvider();
    const dynamodb = new DynamoDB();

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
        throw new Error(`Can not create Cognito user due to an internal error`);
    }

    console.log('User created in Cognito', event);

    const sub = cognitoUserCreated.User
        ?.Attributes
        ?.find((value: AttributeType) => {
            return value.Name === 'sub';
        })?.Value;

    if (!sub) {
        throw new Error(`Cognito user seems to be not created. We couldn't find his SUB field`);
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

    return {
        sub,
    };
}
