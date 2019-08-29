resource "aws_iam_role" "codepipeline_role" {
  name = "${var.app_name}-codepipeline-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codepipeline.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy" "codepipeline_policy" {
  name = "${var.app_name}_ci_policy"
  role = aws_iam_role.codepipeline_role.id

  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect":"Allow",
      "Action": [
        "s3:GetObject",
        "s3:GetObjectVersion",
        "s3:GetBucketVersioning",
        "s3:PutObject"
      ],
      "Resource": [
        "${aws_s3_bucket.ci_bucket.arn}",
        "${aws_s3_bucket.ci_bucket.arn}/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "codebuild:BatchGetBuilds",
        "codebuild:StartBuild",
        "codecommit:BatchGet*",
        "codecommit:BatchDescribe*",
        "codecommit:Get*",
        "codecommit:Describe*",
        "codecommit:List*",
        "codecommit:GitPull",
        "codecommit:UploadArchive",
        "codecommit:GetUploadArchiveStatus",
        "codecommit:CancelUploadArchive",
        "ecr:DescribeImages"
      ],
      "Resource": "*"
    }
  ]
}
EOF
}

//data "aws_kms_alias" "s3kmskey" {
//  name = "alias/myKmsKey"
//}

resource "aws_codepipeline" "codepipeline" {
  name     = "${var.app_name}-pipeline"
  role_arn = aws_iam_role.codepipeline_role.arn

  artifact_store {
    location = aws_s3_bucket.ci_bucket.bucket
    type     = "S3"

    //    encryption_key {
    //      id = data.aws_kms_alias.s3kmskey.arn
    //      type = "KMS"
    //    }
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
        RepositoryName = "Personal-Finance"
        BranchName     = "develop"
        //        PollForSourceChanges = true
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
      "source_output"]
      output_artifacts = [
      "build_output"]
      version = "1"

      configuration = {
        ProjectName = aws_codebuild_project.build.name
        //        PollForSourceChanges = true
      }
    }
  }
  //
  //  stage {
  //    name = "Deploy"
  //
  //    action {
  //      name = "Deploy"
  //      category = "Deploy"
  //      owner = "AWS"
  //      provider = "CloudFormation"
  //      input_artifacts = [
  //        "build_output"]
  //      version = "1"
  //
  //      configuration = {
  //        ActionMode = "REPLACE_ON_FAILURE"
  //        Capabilities = "CAPABILITY_AUTO_EXPAND,CAPABILITY_IAM"
  //        OutputFileName = "CreateStackOutput.json"
  //        StackName = "MyStack"
  //        TemplatePath = "build_output::sam-templated.yaml"
  //      }
  //    }
  //  }
}
