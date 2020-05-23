// Help function to generate an IAM policy
import * as AWS from 'aws-sdk';

const generatePolicy = function (principalId: string, effect: string, resource: string) {
    const authResponse: any = {};

    authResponse.principalId = principalId;
    if (effect && resource) {
        const policyDocument: any = {};
        policyDocument.Version = '2012-10-17';
        policyDocument.Statement = [];
        const statementOne: any = {};
        statementOne.Action = 'execute-api:Invoke';
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
    }

    // Optional output with custom properties of the String, Number or Boolean type.
    authResponse.context = {
        "stringKey": "stringval",
        "numberKey": 123,
        "booleanKey": true
    };
    return authResponse;
}

export const handler = async (event: any) => {
    const token = event.authorizationToken;
    console.log(event);

    const cognito = new AWS.CognitoIdentityServiceProvider();
    try {
        const user = await cognito.getUser({
            AccessToken: token,
        }).promise();

        const policy = generatePolicy('user', 'Allow', event.methodArn);
        policy.context = {};
        policy.context['username'] = user.Username;
        user.UserAttributes.forEach(attr => {
            policy.context[attr.Name] = attr.Value;
        });
        console.log(JSON.stringify(policy));
        return policy;
    } catch (e) {
        throw new Error('Unauthorized');
        // return generatePolicy('user', 'Deny', event.methodArn);
    }

}

