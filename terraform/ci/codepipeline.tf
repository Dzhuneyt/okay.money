resource "aws_codepipeline" "codepipeline_develop" {
  name     = "${var.tag}-develop"
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
        BranchName     = "develop"
        # There is now a CloudWatch event for CodeCommit changes
        //        PollForSourceChanges = false
      }
    }
  }

  stage {
    name = "Build"

    action {
      name     = "Build"
      category = "Build"
      owner    = "AWS"
      provider = "CodeBuild"
      input_artifacts = [
        "source_output"
      ]
      output_artifacts = [
        "build_output"
      ]
      version = "1"

      configuration = {
        ProjectName = aws_codebuild_project.codebuild_develop.name
      }
    }
  }
  tags = {
    Branch = "develop"
    Name   = var.tag
  }
}
