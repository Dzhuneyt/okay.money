import {LambdaIntegrationOptions, PassthroughBehavior} from "aws-cdk-lib/aws-apigateway";
import {IFunction} from "aws-cdk-lib/aws-lambda";
import * as orig from 'aws-cdk-lib/aws-apigateway'

export class LambdaIntegration extends orig.LambdaIntegration {
    constructor(handler: IFunction, options?: LambdaIntegrationOptions) {
        const newOptions: LambdaIntegrationOptions = {
            ...options,
            proxy: true,
            passthroughBehavior: PassthroughBehavior.WHEN_NO_MATCH,
        }
        super(handler, newOptions);
    }

}
