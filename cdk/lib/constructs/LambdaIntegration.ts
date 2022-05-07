import * as orig from "aws-cdk-lib/aws-apigateway";
import {LambdaIntegrationOptions} from "aws-cdk-lib/aws-apigateway";
import {IFunction} from "aws-cdk-lib/aws-lambda";

export class LambdaIntegration extends orig.LambdaIntegration {
    constructor(handler: IFunction, options?: LambdaIntegrationOptions) {
        super(handler, {
            ...options,
        });
    }

}
