import {LambdaIntegration as OriginalLambdaIntegration, PassthroughBehavior} from '@aws-cdk/aws-apigateway';
import {LambdaIntegrationOptions} from '@aws-cdk/aws-apigateway/lib/integrations/lambda';
import * as lambda from '@aws-cdk/aws-lambda';

export class LambdaIntegration extends OriginalLambdaIntegration {
    constructor(handler: lambda.IFunction, options?: LambdaIntegrationOptions) {
        const newOptions: LambdaIntegrationOptions = {
            ...options,
            proxy: true,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        }
        super(handler, newOptions);
    }

}
