resource "aws_codebuild_project" "codebuild_develop_push_to_ecr" {
  name          = "${var.tag}-${var.branch_name}-ecr-push"
  description   = "Push images to ECR for ${var.tag}"
  build_timeout = "20"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }
  cache {
    type = "LOCAL"
    modes = [
      "LOCAL_DOCKER_LAYER_CACHE",
      "LOCAL_SOURCE_CACHE"
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
      stream_name = "ecr-push-${var.branch_name}"
    }

    s3_logs {
      status   = "ENABLED"
      location = "${var.s3_ci_bucket}/codebuild/logs/${var.branch_name}/ecr-push.txt"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec-ecr-push.yml"
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
    Branch = var.branch_name
    Name   = var.tag
  }
}
