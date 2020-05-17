#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {CognitoStack} from '../lib/CognitoStack';
import {RestApisStack} from '../lib/RestApisStack';

const app = new cdk.App();
try {
    const cognitoStack = new CognitoStack(app, 'personalfinance-cognito', {});
    new RestApisStack(app, 'personalfinance-rest-apis', {
        userPool: cognitoStack.userPool
    });
} catch (e) {
    console.error(e);
    throw new Error('Failed to deploy CDK stacks');
}

