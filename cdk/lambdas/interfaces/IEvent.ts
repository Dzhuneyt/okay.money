import {APIGatewayProxyEvent} from 'aws-lambda';

export interface IEvent {
    requestContext: {
        authorizer: {
            claims: {
                // Cognito user ID
                sub: string,
                // Cognito username
                "cognito:username": string,
            }
        }
    },

    // Request body
    body: string,
}
