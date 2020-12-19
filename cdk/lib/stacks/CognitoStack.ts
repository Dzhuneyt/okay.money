import {UserPool} from '@aws-cdk/aws-cognito';
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {StringParameter} from '@aws-cdk/aws-ssm';
import {Construct, Duration, Stack, StackProps} from '@aws-cdk/core';
import {LambdaTypescript} from "../constructs/LambdaTypescript";
import {getPropsByLambdaFilename} from "../constructs/rest/util/getLambdaCode";

interface Props extends StackProps {

}

export class CognitoStack extends Stack {
    public userPool: UserPool;
    public userTable: Table;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        this.userPool = new UserPool(this, 'users', {
            passwordPolicy: {
                minLength: 6,
                requireDigits: false,
                requireLowercase: false,
                requireSymbols: false,
                requireUppercase: false,
            },
        });
        this.userTable = new Table(this, 'table-users', {
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            serverSideEncryption: true,
        });
        new StringParameter(this, 'param-table-name-users', {
            stringValue: this.userTable.tableName,
            parameterName: '/personalfinance/table/users/name',
        });
        new StringParameter(this, 'param-table-arn-users', {
            stringValue: this.userTable.tableArn,
            parameterName: '/personalfinance/table/users/arn',
        });

        // Create a utility Lambda for being able to create new users
        // by calling that Lambda from the AWS console using a payload like:
        // {username: "test", password: "testtest"}
        const fnCreateUser = new LambdaTypescript(this, 'fn-create-user', {
            ...getPropsByLambdaFilename('user-create.ts'),
            timeout: Duration.seconds(10),
            environment: {
                COGNITO_USERPOOL_ID: this.userPool.userPoolId,
                TABLE_NAME_USERS: this.userTable.tableName,
            }
        });
        fnCreateUser.addToRolePolicy(new PolicyStatement({
            resources: [this.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));
        this.userTable.grantReadWriteData(fnCreateUser);
    }
}
