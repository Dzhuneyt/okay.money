import {test as base} from '@playwright/test'
import {randEmail} from '@ngneat/falso';
import * as AWS from "aws-sdk";
import {APIGateway, CloudFormation, DynamoDB} from "aws-sdk";

async function resolveApiUrl(envName: string) {
    if (!envName) {
        throw new Error(`envName is not provided. Can not resolve API Gateway URL`);
    }

    const described = await new CloudFormation({httpOptions: {connectTimeout: 2000}})
        .describeStackResources({
            StackName: `finance-${envName}-rest-apis`,
        }).promise()
    const apiGwResource = described.StackResources.find(x => x.ResourceType === 'AWS::ApiGateway::RestApi');
    const restApiId = apiGwResource.PhysicalResourceId as string;
    const stages = await new APIGateway().getStages({
        restApiId,
    }).promise()
    const stageName = stages.item.find(x => true).stageName;
    const region = AWS.config.region;

    return `https://${restApiId}.execute-api.${region}.amazonaws.com/${stageName}/`;
}

export const test = base.extend<{
    createTestUser: () => Promise<{
        email: string, password: string,
    }>,
}>({
    createTestUser: async ({request}, use) => {
        await use(async () => {
            const email = randEmail();
            const password = 'Pa$$w0rd';

            const envName = process.env.ENV_NAME;
            if (!envName) {
                throw new Error(`process.env.ENV_NAME is not defined`);
            }

            async function registerUser(apiUrl: string) {
                const result = await request.post(`${apiUrl}api/register`, {
                    data: {
                        email, password,
                    }
                })
                await test.expect(result.ok()).toBeTruthy();
            }

            async function getTableForRegistrationTokens() {
                let NextToken: string | undefined = undefined;
                do {
                    const resources = await new CloudFormation().listStackResources({
                        StackName: `finance-${envName}-rest-apis`,
                        NextToken,
                    }).promise()

                    const tableName = resources.StackResourceSummaries
                        .filter(x => x.ResourceType === 'AWS::DynamoDB::Table')
                        .find(x => {
                            return x.LogicalResourceId.toLowerCase().startsWith('authregisterregistrationtokens');
                        })?.PhysicalResourceId

                    if (tableName) {
                        return tableName;
                    }

                    NextToken = resources.NextToken;
                } while (NextToken);
            }

            async function getRegistrationTokenByEmail(email: string) {
                const tableName = await getTableForRegistrationTokens();
                const items = await new DynamoDB().scan({
                    TableName: tableName,
                }).promise();
                const token = items.Items.map(x => DynamoDB.Converter.unmarshall(x)).find(x => x.email === email)?.id;
                if (!token) {
                    throw new Error(`Could no find registration token for email ${email}`);
                }
                return token;
            }

            const apiUrl = await resolveApiUrl(envName);
            await registerUser(apiUrl);

            const token = await getRegistrationTokenByEmail(email);

            async function confirmRegistration(apiUrl: string, token: string, password: string) {
                const result = await request.post(`${apiUrl}api/register/confirm`, {
                    data: {
                        token, password,
                    }
                })
                await test.expect(result.ok()).toBeTruthy();
            }

            await confirmRegistration(apiUrl, token, password);

            return {
                email,
                password,
            }
        });
    }
})
