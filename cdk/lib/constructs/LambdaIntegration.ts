import {LambdaIntegration as OriginalLambdaIntegration, PassthroughBehavior} from '@aws-cdk/aws-apigateway';
import {LambdaIntegrationOptions} from '@aws-cdk/aws-apigateway/lib/integrations/lambda';
import * as lambda from '@aws-cdk/aws-lambda';

export class LambdaIntegration extends OriginalLambdaIntegration {
    constructor(handler: lambda.IFunction, options?: LambdaIntegrationOptions) {
        const newOptions: LambdaIntegrationOptions = {
            ...options,
            proxy: true,
            // integrationResponses: [{
            //     statusCode: "200",
            //     responseTemplates: {"application/json": "{ \"statusCode\": 200 }"}
            // }],
            passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
            // integrationResponses: [
            //     {
            //         statusCode: "200",
            //         responseTemplates: {
            //             "application/json": "#set ($root=$input.path('$')) { \"stage\": \"$root.name\", \"user-id\": \"$root.key\" }",
            //         }
            //     }
            // ]
        }
        super(handler, newOptions);
    }

}
