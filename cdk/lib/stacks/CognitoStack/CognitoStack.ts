import {LambdaTypescript} from "../../constructs/LambdaTypescript";
import {UserPool, UserPoolClient, UserPoolOperation} from "aws-cdk-lib/aws-cognito";
import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {AttributeType, BillingMode, Table, TableEncryption} from "aws-cdk-lib/aws-dynamodb";
import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {PolicyStatement} from "aws-cdk-lib/aws-iam";
import * as path from "path";

interface Props extends StackProps {
}

export class CognitoStack extends Stack {
    public userPool: UserPool;
    public userPoolClient: UserPoolClient;
    public userTable: Table;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        const appName = `finance/${process.env.ENV_NAME}`;

        this.userPool = new UserPool(this, 'users', {
            passwordPolicy: {
                minLength: 6,
                requireDigits: false,
                requireLowercase: false,
                requireSymbols: false,
                requireUppercase: false,
            },
        });

        // Trigger a Lambda just when a user is about to be created in the UserPool
        // This Lambda can enrich the user object, cancel registration or set extra attributes like "automatically confirm this user"
        this.userPool.addTrigger(UserPoolOperation.PRE_SIGN_UP, new LambdaTypescript(this, 'PRE_SIGN_UP', {
            entry: path.resolve(__dirname, 'triggers/pre-signup.ts'),
            timeout: Duration.seconds(30),
        }));

        // If the user is confirmed (created) - invoke this Lambda. This usually happens just once for every user
        this.userPool.addTrigger(UserPoolOperation.POST_CONFIRMATION, new LambdaTypescript(this, 'POST_CONFIRMATION', {
            entry: path.resolve(__dirname, 'triggers/post-confirmation.ts'),
            timeout: Duration.seconds(30),
            initialPolicy: [
                new PolicyStatement({
                    actions: ['ses:SendEmail'],
                    resources: ['*'],
                }),
            ]
        }))

        this.userPool.addDomain('domain', {
            cognitoDomain: {
                domainPrefix: `okay-money-${process.env.ENV_NAME}`,
            }
        });

        new StringParameter(this, 'param-cognito-userpool-id', {
            stringValue: this.userPool.userPoolId,
            parameterName: `/${appName}/pool/id`,
        });

        // Allow the Lambda to do username/password login to Cognito and get Access Token
        this.userPoolClient = this.userPool.addClient('cognito-login', {
            authFlows: {
                userPassword: true,
            },
            accessTokenValidity: Duration.hours(12),
        });
        new StringParameter(this, 'param-cognito-userpool-client-id', {
            stringValue: this.userPoolClient.userPoolClientId,
            parameterName: `/${appName}/pool/client/id`,
        });

        this.userTable = new Table(this, 'table-users', {
            partitionKey: {
                name: "id",
                type: AttributeType.STRING,
            },
            billingMode: BillingMode.PAY_PER_REQUEST,
            encryption: TableEncryption.AWS_MANAGED,
        });

        new StringParameter(this, 'param-table-name-users', {
            stringValue: this.userTable.tableName,
            parameterName: `/${appName}/table/users/name`,
        });
        new StringParameter(this, 'param-table-arn-users', {
            stringValue: this.userTable.tableArn,
            parameterName: `/${appName}/table/users/arn`,
        });
    }
}
