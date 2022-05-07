import {StringParameter} from "aws-cdk-lib/aws-ssm";
import {BuildSpec, Cache, LinuxArmBuildImage, LinuxBuildImage, PipelineProject} from "aws-cdk-lib/aws-codebuild";
import {ManagedPolicy} from "aws-cdk-lib/aws-iam";
import {Bucket, BucketEncryption, IBucket} from "aws-cdk-lib/aws-s3";
import {Annotations, Duration, RemovalPolicy, SecretValue, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Artifact, Pipeline} from "aws-cdk-lib/aws-codepipeline";
import {CodeBuildAction, GitHubSourceAction} from "aws-cdk-lib/aws-codepipeline-actions";
import * as path from "path";

export class CIStack extends Stack {
    private readonly cacheBucket: IBucket;
    private readonly branchName: string;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        this.branchName = process.env.BRANCH_NAME as string;

        if (!this.branchName) {
            Annotations.of(this).addError(`process.env.BRANCH_NAME is required to Deploy ${path.resolve(__dirname)}/CiStack.ts`);
        }

        this.cacheBucket = this.getCacheBucket();

        const sourceArtifact = new Artifact();

        const pipeline = this.getPipeline();

        const githubToken = StringParameter.fromStringParameterName(this, 'GithubSecret', 'GITHUB_TOKEN');

        // new CodePipelinePostToGitHub(pipeline, 'CodePipelinePostToGitHub', {
        //     pipeline,
        //     githubToken,
        // });

        pipeline.addStage({
            stageName: "Source",
            actions: [
                new GitHubSourceAction({
                    actionName: 'GitHub',
                    output: sourceArtifact,
                    oauthToken: SecretValue.plainText(githubToken.stringValue),
                    owner: 'Dzhuneyt',
                    repo: 'okay.money',
                    branch: this.branchName,
                }),
            ],
        });

        const deployProject = new PipelineProject(this, 'CDK-Deploy', {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            cache: Cache.bucket(this.cacheBucket, {prefix: 'cdk-deploy'}),
            environment: {
                buildImage: LinuxArmBuildImage.AMAZON_LINUX_2_STANDARD_2_0,
                privileged: true,
            },
            environmentVariables: {
                ENV_NAME: {value: this.branchName},
            },
        });
        deployProject.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'))

        const deployAction = new CodeBuildAction({
            actionName: "CDK-Deploy",
            input: sourceArtifact,
            project: deployProject,
        });
        pipeline.addStage({
            stageName: "Deploy",
            actions: [
                deployAction,
            ],
        })
    }

    getPipeline() {
        return new Pipeline(this, 'Pipeline', {
            crossAccountKeys: false, // save some costs
            artifactBucket: this.cacheBucket,
            pipelineName: `okaymoney-ci--${this.branchName}`,
        });
    }

    private getCacheBucket() {
        return new Bucket(this, 'CacheBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            encryption: BucketEncryption.S3_MANAGED,
            lifecycleRules: [
                {
                    expiration: Duration.days(7),
                    abortIncompleteMultipartUploadAfter: Duration.days(7),
                },
            ],
        });
    }
}
