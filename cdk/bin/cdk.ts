#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {Environment, Stack, Tags} from '@aws-cdk/core';
import 'source-map-support/register';
import {CognitoStack} from '../lib/stacks/CognitoStack/CognitoStack';
import {DynamoDBStack} from '../lib/stacks/DynamoDBStack/DynamoDBStack';
import {RestApisStack} from '../lib/stacks/RestApisStack/RestApisStack';
import {FrontendStack} from "../lib/stacks/FrontendStack/FrontendStack";

const app = new cdk.App({});
const env: Environment = {
    account: "347315207830", // SS Personal
    region: process.env.CDK_DEFAULT_REGION, // SS Personal
}

if (!process.env.ENV_NAME) {
    throw new Error(`process.env.ENV_NAME is not defined`);
}

try {
    const appName = `finance-${process.env.ENV_NAME}`;

    const dynamoStack = new DynamoDBStack(app, `${appName}-dynamodb`, {
        env,
    })
    const cognitoStack = new CognitoStack(app, `${appName}-cognito`, {
        env
    });
    const restApisStack = new RestApisStack(app, `${appName}-rest-apis`, {
        env,
        userPool: cognitoStack.userPool,
        dynamoTables: {
            account: dynamoStack.tableAccount,
            category: dynamoStack.tableCategory,
            transaction: dynamoStack.tableTransaction,
        }
    });

    // Provide a high level stack that depends on all others, providing
    // an easy mechanism to deploy "everything" by just deploying this stack
    const mainStack = new Stack(app, `${appName}-backend`, {env});
    mainStack.addDependency(restApisStack);

    new FrontendStack(app, `${appName}-frontend`, {env});

    Tags.of(app).add('app', 'personal-finance');
} catch (e) {
    console.error(e);
    throw new Error('Failed to deploy CDK stacks');
}

