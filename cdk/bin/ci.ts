#!/usr/bin/env node
import {App, Environment, Tags} from 'aws-cdk-lib';
import 'source-map-support/register';
import {CIStack} from "../lib/stacks/CIStack/CIStack";

const app = new App({});
const env: Environment = {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
}

const envName = process.env.BRANCH_NAME;

if (!envName) {
    throw new Error(`process.env.BRANCH_NAME is not defined`);
}

try {
    const appName = `finance-${envName}`;
    new CIStack(app, `${appName}-ci`, {env});

    Tags.of(app).add('app', 'personal-finance');
} catch (e) {
    console.error(e);
    throw new Error('Failed to deploy CDK CI stack');
}

