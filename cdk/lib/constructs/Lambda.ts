import {PolicyStatement} from '@aws-cdk/aws-iam';
import * as lambda from '@aws-cdk/aws-lambda'
import {Code} from '@aws-cdk/aws-lambda/lib/code';
import {FunctionOptions} from '@aws-cdk/aws-lambda/lib/function';
import {Runtime} from '@aws-cdk/aws-lambda/lib/runtime';
import {Construct} from '@aws-cdk/core';

interface Props extends FunctionOptions {
    /**
     * The runtime environment for the Lambda function that you are uploading.
     * For valid values, see the Runtime property in the AWS Lambda Developer
     * Guide.
     */
    readonly runtime?: Runtime;
    /**
     * The source code of your Lambda function. You can point to a file in an
     * Amazon Simple Storage Service (Amazon S3) bucket or specify your source
     * code as inline text.
     */
    readonly code: Code;
    /**
     * The name of the method within your code that Lambda calls to execute
     * your function. The format includes the file name. It can also include
     * namespaces and other qualifiers, depending on the runtime.
     * For more information, see https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-features.html#gettingstarted-features-programmingmodel.
     *
     * NOTE: If you specify your source code as inline text by specifying the
     * ZipFile property within the Code property, specify index.function_name as
     * the handler.
     */
    readonly handler: string;
}

export class Lambda extends lambda.Function {
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, {
            ...props,
            runtime: props.runtime ? props.runtime : Runtime.NODEJS_12_X,
        });
        this.addToRolePolicy(new PolicyStatement({
            sid: "ReadAndWriteFromTablesAndIndexes",
            actions: ["dynamodb:*"],
            resources: [
                "*",
            ]
        }))
    }
}
