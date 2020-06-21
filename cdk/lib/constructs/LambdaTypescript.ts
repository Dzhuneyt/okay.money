import {PolicyStatement} from '@aws-cdk/aws-iam';
import {NodejsFunction as Original, NodejsFunctionProps} from '@aws-cdk/aws-lambda-nodejs';
import {Construct, Duration} from '@aws-cdk/core';

export class LambdaTypescript extends Original {
    constructor(scope: Construct, id: string, props: NodejsFunctionProps) {
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
    }

}
