import {UserPoolClient, UserPoolClientProps} from "aws-cdk-lib/aws-cognito";
import {Construct} from "constructs";
import {AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId} from "aws-cdk-lib/custom-resources";
import {Stack} from "aws-cdk-lib";

export class UserPoolClientWithSecret extends UserPoolClient {
    userPoolClientSecret: string;

    constructor(scope: Construct, id: string, props: UserPoolClientProps) {
        super(scope, id, props);

        const describeCognitoUserPoolClient = new AwsCustomResource(
            this,
            'DescribeCognitoUserPoolClient',
            {
                resourceType: 'Custom::DescribeCognitoUserPoolClient',
                onCreate: {
                    region: Stack.of(this).region,
                    service: 'CognitoIdentityServiceProvider',
                    action: 'describeUserPoolClient',
                    parameters: {
                        UserPoolId: props.userPool.userPoolId,
                        ClientId: this.userPoolClientId,
                    },
                    physicalResourceId: PhysicalResourceId.of(this.userPoolClientId),
                },
                policy: AwsCustomResourcePolicy.fromSdkCalls({resources: AwsCustomResourcePolicy.ANY_RESOURCE}),
            }
        )

        this.userPoolClientSecret = describeCognitoUserPoolClient.getResponseField('UserPoolClient.ClientSecret');
    }
}
