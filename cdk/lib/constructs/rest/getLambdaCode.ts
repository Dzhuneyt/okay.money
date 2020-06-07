import {Code} from '@aws-cdk/aws-lambda';
import * as path from "path";

export function getLambdaCode(lambdaName: string) {
    return Code.fromAsset(path.resolve(__dirname, '../../../dist/lambdas/', lambdaName))
}
