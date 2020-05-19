import {APIGatewayProxyEvent} from 'aws-lambda';

export interface IEvent {
    requestContext: {
        authorizer: {
            // Cognito user ID
            sub: string,
            // Cognito username
            username: string,
        }
    },

    pathParameters: {
        [key: string]: string,
    },

    // Request body
    body: string,
}
