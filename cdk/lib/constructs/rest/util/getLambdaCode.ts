import {NodejsFunctionProps} from 'aws-cdk-lib/aws-lambda-nodejs/lib/function';
import * as fs from "fs";
import * as path from "path";

export function getPropsByLambdaFilename(fileName: string): Partial<NodejsFunctionProps> {
    const file = path.resolve(__dirname, './../../../../lambdas/', fileName);
    try {
        if (fs.existsSync(file)) {
            return {
                entry: file,
                handler: 'handler',
            }
        }
    } catch (err) {
        console.error(err)
    }
    throw new Error(`Can not find file ${file}`);
}
