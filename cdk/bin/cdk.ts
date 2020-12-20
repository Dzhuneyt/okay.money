#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {Environment, Tags} from '@aws-cdk/core';
import 'source-map-support/register';
import {CognitoStack} from '../lib/stacks/CognitoStack';
import {DynamoDBStack} from '../lib/stacks/DynamoDBStack';
import {RestApisStack} from '../lib/stacks/RestApisStack';

const app = new cdk.App({});
const env: Environment = {
    account: "347315207830", // SS Personal
}
try {
    const dynamoStack = new DynamoDBStack(app, 'personalfinance-dynamodb', {
        env,
    })
    const cognitoStack = new CognitoStack(app, 'personalfinance-cognito', {
        env
    });
    const restApis = new RestApisStack(app, 'personalfinance-rest-apis', {
        env,
        userPool: cognitoStack.userPool,
        dynamoTables: {
            account: dynamoStack.tableAccount,
            category: dynamoStack.tableCategory,
            transaction: dynamoStack.tableTransaction,
        }
    });

    Tags.of(app).add('app', 'personal-finance');
} catch (e) {
    console.error(e);
    throw new Error('Failed to deploy CDK stacks');
}

