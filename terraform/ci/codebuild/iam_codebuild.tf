resource "aws_iam_role" "codebuild_role" {
  name_prefix = "${var.tag}-${var.branch_name}-cb-"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "codebuild.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF
}

data "aws_iam_policy_document" "codebuild_base_policy" {
  version = "2012-10-17"
  statement {
    # Allow CloudBuild to write its logs to CloudWatch
    sid = "AllowCodeBuildWriteLogs"
    resources = [
      "*"
    ]
    actions = [
      "logs:CreateLogGroup",
      "logs:CreateLogStream",
      "logs:PutLogEvents",
    ]
  }

  statement {
    sid = "AlllowCodeBuildToProvisionItself"
    actions = [
      "ec2:CreateNetworkInterface",
      "ec2:DescribeDhcpOptions",
      "ec2:DescribeNetworkInterfaces",
      "ec2:DetachNetworkInterface",
      "ec2:DeleteNetworkInterface",
      "ec2:DescribeSubnets",
      "ec2:DescribeSecurityGroups",
      "ec2:DescribeVpcs",
    ]
    resources = [
      "*"
    ]
  }

  statement {
    # Allow only codebuild runners that are placed on these Subnets
    # to be able to create network interfaces
    sid = "AllowCodeBuildToProvisionOwnNetworkInterfaces"
    actions = [
      "ec2:CreateNetworkInterfacePermission"
    ]
    resources = [
      "arn:aws:ec2:${data.aws_region.current.name}:216987438199:network-interface/*"
    ]
    condition {
      test     = "StringEquals"
      variable = "ec2:AuthorizedService"
      values = [
        "codebuild.amazonaws.com"
      ]
    }
  }

  statement {
    # General requirement for other statements to work
    sid = "AllowCodeBuildToReadS3Artifacts"
    actions = [
      "s3:ListAllMyBuckets"
    ]
    resources = [
      "*"
    ]
  }
  statement {
    # Allow CodeBuild to write to the CI S3 bucket
    sid = "AllowCodeBuildToWriteS3Artifacts"
    actions = [
      "s3:*"
    ]
    resources = [
      data.aws_s3_bucket.ci_bucket.arn,
      "${data.aws_s3_bucket.ci_bucket.arn}/*",
    ]
  }
  statement {
    # Allow CodeBuild to deploy apps using a remote S3 state
    # See https://www.terraform.io/docs/backends/types/s3.html#using-the-s3-remote-state
    sid = "AllowCodeBuildToUseTerraformBackend"
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = [
      data.aws_s3_bucket.terraform_backend.arn,
      "${data.aws_s3_bucket.terraform_backend.arn}/personal-finance*"
    ]
  }

  statement {
    # Allow CodeBuild to aqcuire remote state lock
    sid = "AllowCodeBuildToAcquireTerraformBackendStateLock"
    resources = [
      data.aws_dynamodb_table.terraform_remote_state_lock.arn,
      "arn:aws:dynamodb:*:*:table/terraform-lock",
    ]
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem",
      "dynamodb:Describe*",
      "dynamodb:ListTagsOfResource",
    ]
  }

  statement {
    # Allow CloudBuild to read keys from Parameter Store
    sid = "AllowCodeBuildToReadParamsFromParameterStore"
    actions = [
      "ssm:GetParameters"
    ]
    resources = [
      "arn:aws:ssm:*:*:parameter/personalfinance*"
    ]
  }

  statement {
    sid = "AllowCodeBuildToPushECRImages"
    actions = [
      "ecr:GetAuthorizationToken"
    ]
    resources = [
    "*"]
  }
  statement {
    # Allow CodeBuild to push ECR images
    sid = "AllowCodeBuildToPullECRImages"
    actions = [
      # Allow pushing
      "ecr:GetAuthorizationToken",

      # Allow pulling
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:GetRepositoryPolicy",
      "ecr:DescribeRepositories",
      "ecr:ListImages",
      "ecr:DescribeImages",
      "ecr:BatchGetImage",
      "ecr:InitiateLayerUpload",
      "ecr:UploadLayerPart",
      "ecr:CompleteLayerUpload",
      "ecr:PutImage"
    ]
    resources = [
      "arn:aws:ecr:*:*:repository/finance/*"
    ]
  }
}
resource "aws_iam_policy" "codebuild_base_policy" {
  name_prefix = "${var.tag}-codebuild-policy-"
  policy      = data.aws_iam_policy_document.codebuild_base_policy.json
}
resource "aws_iam_role_policy_attachment" "codebuild_policy_attachment_1" {
  policy_arn = aws_iam_policy.codebuild_base_policy.arn
  role       = aws_iam_role.codebuild_role.name
}

# Allow CodeBuild to invoke other AWS services
# Allow CodeBuild to do Terraform operations
resource "aws_iam_role_policy_attachment" "codebuild_terraform_policy_attachment_1" {
  policy_arn = aws_iam_policy.terraform_policy.arn
  role       = aws_iam_role.codebuild_role.name
}
