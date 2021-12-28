import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Construct, Duration} from '@aws-cdk/core';
import {WatchableNodejsFunction, WatchableNodejsFunctionProps} from "cdk-watch";

export class LambdaTypescript extends WatchableNodejsFunction {
    constructor(scope: Construct, id: string, props: WatchableNodejsFunctionProps) {
        super(scope, id, {
            timeout: Duration.seconds(30),
            ...props,
        });
        this.addToRolePolicy(new PolicyStatement({
            sid: "AllowGettingTableNames",
            actions: ["ssm:GetParameter"],
            resources: ["*"],
        }))
        this.addToRolePolicy(new PolicyStatement({
            actions: ["dynamodb:*"],
            resources: ["*"],
        }));
        this.addEnvironment('ENV_NAME', process.env.ENV_NAME as string);
    }

}
