resource "aws_codepipeline" "codepipeline_master" {
  name     = "${var.tag}-prod"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.ci_bucket.bucket
    type     = "S3"
  }

  stage {
    name = "Source"

    action {
      name     = "Source"
      category = "Source"
      owner    = "AWS"
      provider = "CodeCommit"
      version  = "1"
      output_artifacts = [
        "source_output"
      ]

      configuration = {
        # Must match the name from
        # https://eu-west-1.console.aws.amazon.com/codesuite/codecommit/repositories?region=eu-west-1
        RepositoryName = data.aws_codecommit_repository.test.repository_name
        BranchName     = "master"
        # There is now a CloudWatch event for CodeCommit changes
        PollForSourceChanges = false
      }
    }
  }

  stage {
    name = "Build"

    action {
      name     = "RunTests"
      category = "Test"
      owner    = "AWS"
      provider = "CodeBuild"
      input_artifacts = [
        "source_output"
      ]
      output_artifacts = [
        "test_output"
      ]
      version = "1"

      configuration = {
        ProjectName = module.codebuild_master.codebuild_tests
      }

      run_order = 1
    }

    action {
      name     = "PushToECR"
      category = "Build"
      owner    = "AWS"
      provider = "CodeBuild"
      input_artifacts = [
        "source_output"
      ]
      output_artifacts = [
        "ecr_push_output"
      ]
      version = "1"

      configuration = {
        ProjectName = module.codebuild_master.codebuild_ecr_push
      }

      # TODO make this run after tests
      run_order = 1
    }
  }
  stage {
    name = "Deploy"

    action {
      name     = "Deploy"
      category = "Build"
      owner    = "AWS"
      provider = "CodeBuild"
      input_artifacts = [
        "ecr_push_output"
      ]
      output_artifacts = [
        "deploy_output"
      ]
      version = "1"

      configuration = {
        ProjectName = module.codebuild_master.codebuild_app_deploy
      }

      run_order = 1
    }
  }

  # TODO https://medium.com/@ruslanfg/aws-codepipeline-approval-and-configuring-it-via-terraform-24870322f40

  tags = {
    Branch = "develop"
    Name   = var.tag
  }
}
