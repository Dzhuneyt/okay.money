import {UserPool} from '@aws-cdk/aws-cognito';
import {AttributeType, BillingMode, Table} from '@aws-cdk/aws-dynamodb';
import {PolicyStatement} from '@aws-cdk/aws-iam';
import {Code} from '@aws-cdk/aws-lambda';
import {Construct, Duration, Stack, StackProps} from '@aws-cdk/core';
import * as path from 'path';
import {Lambda} from '../constructs/Lambda';

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
        })

        const fnCreateUser = new Lambda(this, 'fn-create-user', {
            code: Code.fromAsset(path.resolve(__dirname, '../../dist/lambdas/user-create')),
            handler: 'index.handler',
            timeout: Duration.seconds(10),
        });
        fnCreateUser.addEnvironment('COGNITO_USERPOOL_ID', this.userPool.userPoolId);
        fnCreateUser.addToRolePolicy(new PolicyStatement({
            resources: [this.userPool.userPoolArn],
            actions: [
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword",
            ]
        }));
        fnCreateUser.addEnvironment("TABLE_NAME_USERS", this.userTable.tableName);
        this.userTable.grantReadWriteData(fnCreateUser);
    }
}
