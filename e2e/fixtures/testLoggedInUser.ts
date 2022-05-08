import {test as base} from '@playwright/test';
import {v4 as uuid} from 'uuid';
import CognitoPassword from "./util/CognitoPassword";
import {Lambda, SSM} from "aws-sdk";

// Declare the types of your fixtures.
type LoggedInUserFixture = {
    loggedInUser: {
        email: string,
        password: string,
        sub: string, // Cognito generated ID
    }
};

const getInternalUserCreationLambdaArn = async () => {
    // Retrieve reference to the Lambda created in cdk/lib/stacks/RestApisStack/constructs/AuthEndpoints/Register.ts->createInternalUserCreationLambda()
    const name = `/okaymoney/${process.env.ENV_NAME}/internal/user-creation-lambda-arn`;
    const param = await new SSM().getParameter({
        WithDecryption: true,
        Name: name,
    }).promise();

    if (!param.Parameter.Value) {
        throw new Error(`Can not retrieve SSM parameter: ${name}`);
    }
    return param.Parameter.Value as string;
}

const createUserInternally = async (email: string, password: string) => {
    const lambdaArn = await getInternalUserCreationLambdaArn();
    const result = await new Lambda().invoke({
        FunctionName: lambdaArn,
        Payload: JSON.stringify({email, password}),
    }).promise();
    if (result.StatusCode !== 200) {
        console.error(result.StatusCode, result.FunctionError, result.LogResult, result.Payload);
        throw new Error(`Lambda invocation for creating an user internally failed with a status code of ${result.StatusCode}`);
    }
    return JSON.parse(result.Payload.toString()) as { sub: string };
}

// Extend base test by providing "todoPage" and "settingsPage".
// This new "test" can be used in multiple test files, and each of them will get the fixtures.
export const test = base.extend<LoggedInUserFixture>({
    loggedInUser: [async ({page}, use) => {
        // Set up the fixture.
        const randomId = uuid();
        const cognitoPassword = new CognitoPassword();
        const email = `e2e-test-${randomId}@example.com`;
        const password = cognitoPassword.generate({length: 16});

        const cognitoResult = await createUserInternally(email, password);
        const sub = cognitoResult.sub;

        const loggedInUser = {
            email,
            password,
            sub,
        }

        await page.goto('/auth/login');
        await page.locator('input[type=email]').fill(loggedInUser.email);
        await page.locator('input[type=password]').fill(loggedInUser.password);
        await page.locator('button[type=button]', {hasText: 'Login'}).click();
        await page.locator('h3', {hasText: 'Statement of assets'}).waitFor();

        // Use the fixture value in the test.
        await use(loggedInUser);

        // @TODO purge the user now
        // Clean up the fixture.
        // await loggedInUser.purge();
    }, {auto: true}],
});
export {expect} from '@playwright/test';
