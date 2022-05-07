import {
    AllowedMethods,
    CacheCookieBehavior,
    CacheHeaderBehavior,
    CachePolicy,
    CacheQueryStringBehavior,
    Distribution,
    IDistribution,
    OriginAccessIdentity,
    PriceClass,
    ViewerProtocolPolicy
} from "aws-cdk-lib/aws-cloudfront";
import {BucketDeployment, Source} from "aws-cdk-lib/aws-s3-deployment";
import {ARecord, HostedZone, IHostedZone, RecordTarget} from "aws-cdk-lib/aws-route53";
import {Annotations, CfnOutput, Duration, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {CloudFrontTarget} from "aws-cdk-lib/aws-route53-targets";
import {Bucket, IBucket} from "aws-cdk-lib/aws-s3";
import {Construct} from "constructs";
import {Certificate, ICertificate} from "aws-cdk-lib/aws-certificatemanager";
import {RestApi} from "aws-cdk-lib/aws-apigateway";
import {HttpOrigin, S3Origin} from "aws-cdk-lib/aws-cloudfront-origins";
import * as path from 'path';

function isDirectory(directory: string) {
    const fs = require('fs');
    try {
        // Query the entry
        const stats = fs.lstatSync(directory);

        // Is it a directory?
        if (stats.isDirectory()) {
            // Yes it is
            return true;
        }
    } catch (e) {
    }
    return false;
}

interface Props extends StackProps {
    api: RestApi,
}

export class FrontendStack extends Stack {
    private readonly bucket: IBucket;
    private readonly distribution: IDistribution;

    constructor(scope: Construct, private id: string, private props: Props) {
        super(scope, id, props);

        const hostedZone = this.getHostedZone();
        const certificate = this.getCertificate();

        this.bucket = new Bucket(this, 'Bucket', {
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true,
        });

        if (!process.env.FRONTEND_PATH) {
            // Try to auto resolve, relatively
            process.env.FRONTEND_PATH = path.resolve(__dirname, '../../../../frontend/dist/frontend/');
        }

        if (!isDirectory(process.env.FRONTEND_PATH as string)) {
            Annotations.of(this)
                .addWarning(`Skipping deployment of frontend because process.env.FRONTEND_PATH does not lead to a valid directory`);
        } else {
            new BucketDeployment(this, 'BucketDeployment', {
                sources: [Source.asset(process.env.FRONTEND_PATH as string)],
                destinationBucket: this.bucket,
            });
        }

        /**
         * Allow this OriginAccessIdentity to access private bucket contents
         * CloudFront will use this OriginAccessIdentity to communicate with S3
         */
        const originAccessIdentity = new OriginAccessIdentity(this, 'OriginAccessIdentity');
        this.bucket.grantRead(originAccessIdentity);

        /**
         * Create the CloudFront distribution that serves as a "proxy"
         * before the static Angular frontend (stored in S3) and the backend
         * APIs (powered by API Gateway)
         */
        this.distribution = new Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: new S3Origin(this.bucket, {originAccessIdentity}),
                viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: CachePolicy.CACHING_DISABLED, // @TODO default seems to cache too aggressively so disable for now
                compress: true,
            },

            /**
             * When "/" is visited, assume it is index.html
             */
            defaultRootObject: 'index.html',

            additionalBehaviors: {
                /**
                 * Define path regex and behavior configuration for backend API calls
                 */
                '/api/*': {
                    origin: new HttpOrigin(this.props.api.url.split('/')[2], {
                        originPath: '/prod',
                    }),

                    // Disable cache completely for this origin
                    cachePolicy: new CachePolicy(this, 'CachePolicy2', {
                        headerBehavior: CacheHeaderBehavior.allowList(
                            // These headers will reach the Origin
                            // All others are stripped
                            'x-api-key',
                            'authorization',
                        ),
                        cookieBehavior: CacheCookieBehavior.none(),
                        queryStringBehavior: CacheQueryStringBehavior.all(),
                        maxTtl: Duration.seconds(1),
                        defaultTtl: Duration.seconds(1),
                        enableAcceptEncodingBrotli: true,
                        enableAcceptEncodingGzip: true,
                    }),
                    allowedMethods: AllowedMethods.ALLOW_ALL,
                    viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
                }
            },
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
            ? Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:us-east-1:526302546747:certificate/615027f2-60ef-4a3d-b7a9-f41ded470cf5')
            : undefined;
    }
}
