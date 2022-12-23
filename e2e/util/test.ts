import {APIRequestContext, test as base} from '@playwright/test'
import {randEmail} from '@ngneat/falso';
import * as AWS from "aws-sdk";
import {APIGateway, CloudFormation, DynamoDB, SSM} from "aws-sdk";

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
    const stageName = stages.item.find(_ => true).stageName;
    const region = AWS.config.region;

    return `https://${restApiId}.execute-api.${region}.amazonaws.com/${stageName}/`;
}

class RandomUser {

    public email: string;
    public password: string;

    private envName: string;

    constructor(protected request: APIRequestContext) {
        this.email = randEmail();
        this.password = 'Pa$$w0rd';

        const envName = process.env.ENV_NAME as string;
        if (!envName) {
            throw new Error(`process.env.ENV_NAME is not defined`);
        }

        this.envName = envName;
    }

    async register() {
        const apiUrl = await this.getApiUrl();
        const result = await this.request.post(`${apiUrl}api/register`, {
            data: {
                email: this.email, password: this.password,
            }
        })
        await test.expect(result.ok()).toBeTruthy();
    }

    private async getApiUrl() {
        const Name = `/finance/${process.env.ENV_NAME}/api-url`;
        const param = await new SSM().getParameter({
            Name,
            WithDecryption: true,
        }).promise()
        if (!param.Parameter.Value) {
            throw new Error(`Can not find SSM parameter with name ${Name}`)
        }
        return param.Parameter.Value;
    }
}

export const test = base.extend<{
    createTestUser: () => Promise<{
        email: string, password: string,
    }>,
    getRandomUser: () => RandomUser,
}>({
    getRandomUser: async ({request}, use) => {

        // usage:
        // const t = new RandomUser(request);
        // await t.register();
        await use(() => new RandomUser(request));
    },
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
                const param = await new SSM().getParameter({
                    Name: `/finance/${process.env.ENV_NAME}/table/registration-tokens/name`,
                }).promise()
                return param.Parameter.Value as string;
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
