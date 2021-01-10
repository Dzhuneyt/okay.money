import {ResponseType, RestApi} from '@aws-cdk/aws-apigateway';
import {Construct} from '@aws-cdk/core';

export class GatewayResponseMapper extends Construct {
    constructor(scope: Construct, id: string, props: {
        api: RestApi,
    }) {
        super(scope, id);

        [
            ResponseType.DEFAULT_4XX,
            ResponseType.DEFAULT_5XX,
            ResponseType.UNAUTHORIZED,
            ResponseType.ACCESS_DENIED,
            ResponseType.API_CONFIGURATION_ERROR,
            ResponseType.AUTHORIZER_FAILURE,
            ResponseType.AUTHORIZER_CONFIGURATION_ERROR,
            ResponseType.MISSING_AUTHENTICATION_TOKEN,
            ResponseType.BAD_REQUEST_BODY,
            ResponseType.BAD_REQUEST_PARAMETERS,
            ResponseType.EXPIRED_TOKEN,
            ResponseType.INTEGRATION_FAILURE,
            ResponseType.INTEGRATION_TIMEOUT,
            ResponseType.INVALID_SIGNATURE,
            ResponseType.INVALID_API_KEY,
            ResponseType.RESOURCE_NOT_FOUND,
            ResponseType.THROTTLED,
            ResponseType.UNSUPPORTED_MEDIA_TYPE,
        ].forEach(type => {
            // Reformat errors from API gateway into a more friendly and less revealing
            // response body. Also attach CORS headers so that the frontend can read the actual
            // status code and body and react. Otherwise, the browser rejects the request
            // and prevents the frontend from reacting properly. For example, on expired
            // authorization token, the frontend can not detect this error and redirect
            // to the /login page
            props.api.addGatewayResponse('gw-response-' + type.responseType, {
                type,
                responseHeaders: {
                    "Access-Control-Allow-Origin": "'*'",
                    "Access-Control-Allow-Headers": "'*'"

                },
                templates: {
                    "application/json": "{\n     \"message\": $context.error.messageString,\n     \"type\":  \"$context.error.responseType\",\n     \"resourcePath\":  \"$context.resourcePath\",\n }"
                }
            });
        })
    }
}
