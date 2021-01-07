import {Code} from '@aws-cdk/aws-lambda';
import {NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs/lib/function';
import * as fs from "fs";
import * as path from "path";

export function getLambdaCode(lambdaName: string) {
    return Code.fromAsset(path.resolve(__dirname, '../../../dist/lambdas/', lambdaName))
}

export function getPropsByLambdaFilename(fileName: string): Partial<NodejsFunctionProps> {
    const file = path.resolve(__dirname, './../../../../lambdas/', fileName);
    try {
        if (fs.existsSync(file)) {
            // file exists
            return {
                // depsLockFilePath: path.resolve(__dirname, './../../../../'),
                entry: file,
                handler: 'handler',
            }
        }
    } catch (err) {
        console.error(err)
    }
    throw new Error(`Can not find file ${file}`);
}
