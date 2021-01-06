#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import {Environment, Stack, Tags} from '@aws-cdk/core';
import 'source-map-support/register';
import {CognitoStack} from '../lib/stacks/CognitoStack/CognitoStack';
import {DynamoDBStack} from '../lib/stacks/DynamoDBStack/DynamoDBStack';
import {RestApisStack} from '../lib/stacks/RestApisStack/RestApisStack';
import {CIStack} from "../lib/stacks/CIStack/CIStack";

const app = new cdk.App({});
const env: Environment = {
    account: "347315207830", // SS Personal
}

if (!process.env.BRANCH_NAME) {
    throw new Error(`process.env.BRANCH_NAME is not defined`);
}

try {
    const appName = `finance-${process.env.BRANCH_NAME}`;
    new CIStack(app, `${appName}-ci`, {env});

    Tags.of(app).add('app', 'personal-finance');
} catch (e) {
    console.error(e);
    throw new Error('Failed to deploy CDK CI stack');
}

