import {Construct} from "constructs";
import {Duration} from "aws-cdk-lib";
import {ManagedPolicy, PolicyStatement} from "aws-cdk-lib/aws-iam";
import {WatchableNodejsFunction, WatchableNodejsFunctionProps} from "cdk-watch";

export class LambdaTypescript extends WatchableNodejsFunction {
    constructor(scope: Construct, id: string, props: WatchableNodejsFunctionProps) {
        super(scope, id, {
            timeout: Duration.seconds(30),
            ...props,
        });
        this.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMReadOnlyAccess'));
        this.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AmazonDynamoDBFullAccess'));

        this.addEnvironment('ENV_NAME', process.env.ENV_NAME as string);
    }

}
