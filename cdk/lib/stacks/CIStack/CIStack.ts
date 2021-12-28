import {Construct, Duration, RemovalPolicy, SecretValue, Stack, StackProps} from "@aws-cdk/core";
import {Bucket, BucketEncryption, IBucket} from "@aws-cdk/aws-s3";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import {BuildSpec, Cache, ComputeType, LinuxBuildImage, LocalCacheMode, PipelineProject} from "@aws-cdk/aws-codebuild";
import {LogGroup, RetentionDays} from "@aws-cdk/aws-logs";
import {ManagedPolicy} from "@aws-cdk/aws-iam";
import {CodePipelinePostToGitHub} from "@awesome-cdk/cdk-report-codepipeline-status-to-github";
import {StringParameter} from "@aws-cdk/aws-ssm/lib/parameter";

export class CIStack extends Stack {
    private readonly cacheBucket: IBucket;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const branchName = process.env.BRANCH_NAME as string;

        this.cacheBucket = new Bucket(this, 'CacheBucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
            encryption: BucketEncryption.S3_MANAGED,
            lifecycleRules: [
                {
                    expiration: Duration.days(7),
                    abortIncompleteMultipartUploadAfter: Duration.days(7),
                }
            ],
        });

        const sourceArtifact = new codepipeline.Artifact();

        const pipeline = new codepipeline.Pipeline(this, 'Pipeline', {
            crossAccountKeys: false, // save some costs
            artifactBucket: this.cacheBucket,
            pipelineName: `finance-${branchName}-ci`,
        });

        new CodePipelinePostToGitHub(pipeline, 'CodePipelinePostToGitHub', {
            pipeline,
            githubToken: StringParameter.fromStringParameterName(this, 'GithubSecret', 'GITHUB_TOKEN'),
        });

        SecretValue.ssmSecure('', '');


        pipeline.addStage({
            stageName: "Source",
            actions: [
                new codepipeline_actions.GitHubSourceAction({
                    actionName: 'GitHub',
                    output: sourceArtifact,
                    oauthToken: SecretValue.secretsManager('GITHUB_TOKEN_PERSONAL'),
                    // Replace these with your actual GitHub project name
                    owner: 'Dzhuneyt',
                    repo: 'okay.money',
                    branch: branchName,
                }),
            ],
        });

        const project = new PipelineProject(this, 'CDK-Deploy', {
            buildSpec: BuildSpec.fromSourceFilename('buildspec.yml'),
            logging: {
                cloudWatch: {
                    enabled: true,
                    logGroup: new LogGroup(this, 'cdk-deploy-logs', {
                        removalPolicy: RemovalPolicy.DESTROY,
                        retention: RetentionDays.ONE_MONTH,
                    })
                },
            },
            cache: Cache.bucket(this.cacheBucket, {prefix: 'ci'}),
            environment: {
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_3,
                computeType: ComputeType.LARGE,
                privileged: true,
            },
            environmentVariables: {
                ENV_NAME: {
                    value: branchName,
                }
            }
        });
        project.role?.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));

        pipeline.addStage({
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
