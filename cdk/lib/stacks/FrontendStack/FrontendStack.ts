import {Annotations, CfnOutput, Construct, RemovalPolicy, Stack, StackProps} from "@aws-cdk/core";
import {Bucket, IBucket} from "@aws-cdk/aws-s3";
import {
    CachePolicy,
    Distribution,
    IDistribution,
    OriginAccessIdentity,
    PriceClass,
    ViewerProtocolPolicy
} from "@aws-cdk/aws-cloudfront";
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";
import {ARecord, HostedZone, IHostedZone, RecordTarget} from "@aws-cdk/aws-route53";
import {Certificate, ICertificate} from "@aws-cdk/aws-certificatemanager";
import {CloudFrontTarget} from "@aws-cdk/aws-route53-targets";

export class FrontendStack extends Stack {
    private readonly bucket: IBucket;
    private distribution: IDistribution;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

        const hostedZone = this.getHostedZone();
        const certificate = this.getCertificate();

        this.bucket = new Bucket(this, 'Bucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        if (!process.env.FRONTEND_PATH) {
            Annotations.of(this).addError(`FRONTEND_PATH environment variable not set. FrontendStack can not be deployed`);
        } else {
            new BucketDeployment(this, 'BucketDeployment', {
                sources: [Source.asset(process.env.FRONTEND_PATH as string)],
                destinationBucket: this.bucket,
            });
        }

        // Allow CloudFront to access private bucket contents using OriginAccessIdentity
        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        this.bucket.grantRead(originAccessIdentity);

        this.distribution = new Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(this.bucket, {
                    originAccessIdentity,
                }),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                compress: true,
                cachePolicy: CachePolicy.CACHING_OPTIMIZED,
            },
            // When "/" is visited, assume it's index.html
            defaultRootObject: 'index.html',
            errorResponses: [
                // Forward requests to non existing routes always to Angular
                {
                    httpStatus: 404,
                    responsePagePath: '/index.html',
                    responseHttpStatus: 200,
                },
            ],
            domainNames: hostedZone ? [hostedZone.zoneName] : undefined,
            priceClass: PriceClass.PRICE_CLASS_100,
            certificate: certificate,
        });

        // Attach the CloudFront as an Alias target to the Route53 HostedZone
        if (process.env.ENV_NAME === 'master' && hostedZone) {
            new ARecord(this, 'ARecord', {
                zone: hostedZone,
                target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
            });
        }

        // Stack Outputs
        new CfnOutput(this, 'cloudfront-url', {value: this.distribution.distributionDomainName,});
        if (hostedZone) {
            new CfnOutput(this, 'public-url', {value: hostedZone.zoneName});
        }
    }

    getHostedZone(): IHostedZone | undefined {
        return process.env.ENV_NAME === 'master'
            ? HostedZone.fromLookup(this, 'HostedZone', {domainName: 'okay.money'})
            : undefined;
    }

    getCertificate(): ICertificate | undefined {
        // ACM to be used in CloudFront must be in us-east-1 regions
        return process.env.ENV_NAME === 'master'
            ? Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:us-east-1:347315207830:certificate/a855b6f4-8017-4a17-8daa-d56848a1a7af')
            : undefined;
    }
}
