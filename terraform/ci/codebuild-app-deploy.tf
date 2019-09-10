resource "aws_codebuild_project" "codebuild_deploy_to_ecs" {
  name          = "${var.tag}-deploy-to-ecs"
  description   = "Deploy new version of ${var.tag} to ECS"
  build_timeout = "20"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }
  cache {
    type = "LOCAL"
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

    # Example on how to pass "regular" (non secret)
    # environment variables to the builder
    environment_variable {
      name  = "TF_IN_AUTOMATION"
      value = "1"
    }
    environment_variable {
      name  = "BRANCH"
      value = "develop"
    }

    # Pass these env vars to the builder job
    # They will be retrieved from AWS Parameter Store
    environment_variable {
      name  = "TF_VAR_domain_name"
      value = "/personalfinance/domain_name"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TF_VAR_MYSQL_HOST"
      value = "/personalfinance/MYSQL_HOST"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TF_VAR_MYSQL_DB"
      value = "/personalfinance/MYSQL_DB"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TF_VAR_MYSQL_USER"
      value = "/personalfinance/MYSQL_USER"
      type  = "PARAMETER_STORE"
    }
    environment_variable {
      name  = "TF_VAR_MYSQL_PASSWORD"
      value = "/personalfinance/MYSQL_PASSWORD"
      type  = "PARAMETER_STORE"
    }
  }

  logs_config {
    cloudwatch_logs {
      group_name  = aws_cloudwatch_log_group.codebuild.name
      stream_name = "deploy"
    }

    s3_logs {
      status   = "ENABLED"
      location = "${aws_s3_bucket.ci_bucket.id}/develop-deploy-log"
    }
  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec-deploy-version.yml"
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
    Branch = "develop"
    Name   = var.tag
  }
}
