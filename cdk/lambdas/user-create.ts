import * as AWS from 'aws-sdk';

export const handler = async (event: {
    username: string,
    password: string,
}) => {
    const cognito = new AWS.CognitoIdentityServiceProvider();
    const userPoolId = process.env.COGNITO_USERPOOL_ID as string;

    try {
        await cognito.adminCreateUser({
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

        console.log('User created', event.username, event.password);
    } catch (e) {
        console.log('Failed to create a user');
        console.log(e);
    }

    return {};

}
