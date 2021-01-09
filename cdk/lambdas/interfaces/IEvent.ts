export interface IEvent {
    requestContext: {
        authorizer: {
            // This is populated if the API GW endpoint uses the new "native" Cognito authorizer (not the lambda based one)
            claims: {
                // Cognito user ID
                sub: string,
                // Cognito username
                'cognito:username': string,
            }
        }
    },

    pathParameters: {
        [key: string]: string,
    },

    queryStringParameters: {
        [key: string]: string,
    }

    // Request body
    body: string,
}
