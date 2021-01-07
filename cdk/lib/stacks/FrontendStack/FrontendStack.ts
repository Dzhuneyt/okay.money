import {Annotations, Construct, RemovalPolicy, Stack, StackProps} from "@aws-cdk/core";
import {Bucket, IBucket} from "@aws-cdk/aws-s3";
import {Distribution, OriginAccessIdentity} from "@aws-cdk/aws-cloudfront";
import * as origins from '@aws-cdk/aws-cloudfront-origins';
import {BucketDeployment, Source} from "@aws-cdk/aws-s3-deployment";

export class FrontendStack extends Stack {
    private readonly bucket: IBucket;

    constructor(scope: Construct, id: string, props: StackProps) {
        super(scope, id, props);

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

        new Distribution(this, 'Distribution', {
            defaultBehavior: {
                origin: new origins.S3Origin(this.bucket, {
                    originAccessIdentity,
                })
            },
            // When "/" is visited, assume it's index.html
            defaultRootObject: 'index.html',
            // errorResponses: [
            //     // Forward requests to non existing routes always to Angular
            //     {
            //         httpStatus: 403,
            //         responsePagePath: '/index.html',
            //         responseHttpStatus: 200,
            //     },
            //     // Forward requests to non existing routes always to Angular
            //     {
            //         httpStatus: 401,
            //         responsePagePath: '/index.html',
            //         responseHttpStatus: 200,
            //     },
            // ],
        });
    }
}
