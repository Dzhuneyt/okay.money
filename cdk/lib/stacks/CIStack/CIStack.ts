import {Construct, RemovalPolicy, SecretValue, Stack, StackProps, Stage, StageProps, Tags} from "@aws-cdk/core";
import {Bucket, IBucket} from "@aws-cdk/aws-s3";
import {CdkPipeline, SimpleSynthAction} from "@aws-cdk/pipelines";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import {DynamoDBStack} from "../DynamoDBStack/DynamoDBStack";
import {CognitoStack} from "../CognitoStack/CognitoStack";
import {RestApisStack} from "../RestApisStack/RestApisStack";
import {BuildSpec, IProject, PipelineProject} from "@aws-cdk/aws-codebuild";

interface Props extends StageProps {
    branch: string,
}

class MyApplication extends Stage {

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id, props);

        const appName = `finance-${props.branch}`;

        const dynamoStack = new DynamoDBStack(this, `${appName}-dynamodb`, {
            env: props.env,
        })
        const cognitoStack = new CognitoStack(this, `${appName}-cognito`, {
            env: props.env,
        });
        const restApisStack = new RestApisStack(this, `${appName}-rest-apis`, {
            env: props.env,
            userPool: cognitoStack.userPool,
            dynamoTables: {
                account: dynamoStack.tableAccount,
                category: dynamoStack.tableCategory,
                transaction: dynamoStack.tableTransaction,
            }
        });

        // Provide a high level stack that depends on all others, providing
        // an easy mechanism to deploy "everything" by just deploying this stack
        const mainStack = new Stack(this, `${appName}-main`, {env: props.env,});
        mainStack.addDependency(restApisStack);

        Tags.of(this).add('app', 'personal-finance');
    }
}

export class CIStack extends Stack {
    private cacheBucket: IBucket;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const branchName = process.env.BRANCH_NAME as string;

        this.cacheBucket = new Bucket(this, 'CacheBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        const sourceArtifact = new codepipeline.Artifact();

        const ppln = new codepipeline.Pipeline(this, 'Pipeline');
        ppln.addStage({
            stageName: "Source",
            actions: [
                new codepipeline_actions.GitHubSourceAction({
                    actionName: 'GitHub',
                    output: sourceArtifact,
                    oauthToken: SecretValue.secretsManager('GITHUB_TOKEN_PERSONAL'),
                    // Replace these with your actual GitHub project name
                    owner: 'Dzhuneyt',
                    repo: 'Personal-Finance',
                    branch: branchName,
                })
            ],
        });

        const project = new PipelineProject(this, 'CDK-Deploy', {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            logging: {
                s3: {
                    bucket: this.cacheBucket,
                    prefix: `ci-cache-${branchName}`,
                    enabled: true,
                }
            }
        });

        ppln.addStage({
            stageName: "Deploy",
            actions: [
                new codepipeline_actions.CodeBuildAction({
                    actionName: "CDK-Deploy",
                    input: sourceArtifact,
                    project
                })
            ],
        })
    }
}
