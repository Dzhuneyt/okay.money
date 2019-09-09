resource "aws_codebuild_project" "codebuild_develop_tests" {
  name          = "${var.tag}-tests"
  description   = "Execute tests for ${var.tag}"
  build_timeout = "20"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }
  cache {
    type     = "S3"
    location = "${aws_s3_bucket.ci_bucket.bucket}/codebuild/tests/cache"
    modes = [
      "LOCAL_DOCKER_LAYER_CACHE",
      "LOCAL_SOURCE_CACHE",
    ]
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/standard:1.0"
    type                        = "LINUX_CONTAINER"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = true
  }

  logs_config {
    cloudwatch_logs {
      group_name  = aws_cloudwatch_log_group.codebuild.name
      stream_name = "tests"
    }

    s3_logs {
      status   = "ENABLED"
      location = "${aws_s3_bucket.ci_bucket.id}/tests-log"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec-tests.yml"
  }

  vpc_config {
    vpc_id = var.vpc_id

    # Always choose private subnets here
    # See https://docs.aws.amazon.com/codebuild/latest/userguide/vpc-support.html
    # "When you set up your CodeBuild projects to access your VPC, choose private subnets only."
    subnets = var.private_subnets

    security_group_ids = [
      aws_security_group.sg_ci.id,
    ]
  }

  tags = {
    //    Branch = "develop"
    Name = var.tag
  }
}
