#!/usr/bin/env node
import 'source-map-support/register';
import {Environment} from '@aws-cdk/core';
import * as cdk from '@aws-cdk/core';
import {CognitoStack} from '../lib/CognitoStack';
import {RestApisStack} from '../lib/RestApisStack';

const app = new cdk.App({});
const env: Environment = {
    account: "347315207830",
}
try {
    const cognitoStack = new CognitoStack(app, 'personalfinance-cognito', {
        env
    });
    new RestApisStack(app, 'personalfinance-rest-apis', {
        env,
        userPool: cognitoStack.userPool
    });
} catch (e) {
    console.error(e);
    throw new Error('Failed to deploy CDK stacks');
}

