import {Construct} from "constructs";
import {IUserPool} from "aws-cdk-lib/aws-cognito";
import {AuthorizationType, IResource, LambdaIntegration} from "aws-cdk-lib/aws-apigateway";
import {LambdaTypescript} from "../../../../../../constructs/LambdaTypescript";
import * as path from "path";
import {ITable} from "aws-cdk-lib/aws-dynamodb";

export class GoogleSsoInit extends Construct {

    constructor(scope: Construct, id: string, private props: {
        userPool: IUserPool,
        rootResource: IResource,
        userPoolClientId: string,
        userPoolClientSecret: string,
        tableForTemporaryDestinations: ITable,
        callbackUrl: string,
    }) {
        super(scope, id);

        const fn = new LambdaTypescript(this, 'LambdaTypescript', {
            entry: path.resolve(__dirname, 'GoogleSsoInit.lambda.ts'),
            environment: {
                USERPOOL_CLIENT_ID: props.userPoolClientId,
                USERPOOL_CLIENT_SECRET: props.userPoolClientSecret,
                CALLBACK_URL: props.callbackUrl,
            },
            bundling: {
                externalModules: ['aws-sdk'],
            },
        });

        fn.addEnvironment('TABLE_NAME_TEMPORARY_DESTINATIONS', props.tableForTemporaryDestinations.tableName);
        props.tableForTemporaryDestinations.grantWriteData(fn);

        props.rootResource
            .resourceForPath('auth/sso/google/init')
            .addMethod('GET', new LambdaIntegration(fn), {
                authorizationType: AuthorizationType.NONE,
            });
    }
}
