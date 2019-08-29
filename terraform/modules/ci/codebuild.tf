resource "aws_cloudwatch_log_group" "codebuild" {
  name              = "${var.app_name}-codebuild"
  retention_in_days = 14
}
# Add an inline policy
resource "aws_iam_role" "codebuild_role" {
  name = "${var.app_name}-codebuild-role"

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
    actions = [
      "ec2:CreateNetworkInterfacePermission"
    ]
    resources = [
      "arn:aws:ec2:${data.aws_region.current.name}:216987438199:network-interface/*"
    ]
    condition {
      test     = "StringEquals"
      variable = "ec2:Subnet"
      values = [
        "arn:aws:ec2:${data.aws_region.current.name}:216987438199:subnet/${var.private_subnet_ids[0]}",
        "arn:aws:ec2:${data.aws_region.current.name}:216987438199:subnet/${var.private_subnet_ids[1]}",
      ]
    }
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
    actions = [
      "s3:ListAllMyBuckets"
    ]
    resources = [
      "*"
    ]
  }
  statement {
    # Allow CodeBuild to write to the CI S3 bucket
    actions = [
      "s3:*"
    ]
    resources = [
      aws_s3_bucket.ci_bucket.arn,
      "${aws_s3_bucket.ci_bucket.arn}/*",
    ]
  }
  statement {
    # Allow CodeBuild to deploy apps using a remote S3 state
    # See https://www.terraform.io/docs/backends/types/s3.html#using-the-s3-remote-state
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:ListBucket",
      "s3:GetBucketLocation"
    ]
    resources = [
      data.aws_s3_bucket.terraform_backend.arn,
      "${data.aws_s3_bucket.terraform_backend.arn}/personal-finance.tfstate"
    ]
  }

  statement {
    # Allow CodeBuild to aqcuire remote state lock
    resources = [
      data.aws_dynamodb_table.terraform_remote_state_lock.arn
    ]
    actions = [
      "dynamodb:GetItem",
      "dynamodb:PutItem",
      "dynamodb:DeleteItem"
    ]
  }

  statement {
    # Allow CloudBuild to read keys from Parameter Store
    actions = [
      "ssm:GetParameters"
    ]
    resources = [
      "arn:aws:ssm:*:*:parameter/personalfinance*"
    ]
  }

  statement {
    # Allow CodeBuild to push ECR images
    actions = [
      "ecr:GetAuthorizationToken",
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
  name_prefix = "${var.app_name}-codebuild-policy"
  policy      = data.aws_iam_policy_document.codebuild_base_policy.json
}
resource "aws_iam_role_policy_attachment" "codebuild_policy_attachment_1" {
  policy_arn = aws_iam_policy.codebuild_base_policy.arn
  role       = aws_iam_role.codebuild_role.name
}

# Allow CodeBuild to do Terraform operations
resource "aws_iam_role_policy_attachment" "codebuild_terraform_policy_attachment" {
  policy_arn = aws_iam_policy.terraform_policy.arn
  role       = aws_iam_role.codebuild_role.name
}
resource "aws_iam_role_policy" "example" {
  role = aws_iam_role.codebuild_role.name

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Resource": [
        "*"
      ],
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "ec2:CreateNetworkInterface",
        "ec2:DescribeDhcpOptions",
        "ec2:DescribeNetworkInterfaces",
        "ec2:DetachNetworkInterface",
        "ec2:DeleteNetworkInterface",
        "ec2:DescribeSubnets",
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeVpcs"
      ],
      "Resource": "*"
    },
    {
        "Effect": "Allow",
        "Action": [
            "ec2:CreateNetworkInterfacePermission"
        ],
        "Resource": "arn:aws:ec2:${data.aws_region.current.name}:216987438199:network-interface/*",
        "Condition": {
            "StringEquals": {
                "ec2:Subnet": [
                    "arn:aws:ec2:${data.aws_region.current.name}:216987438199:subnet/${var.private_subnet_ids[0]}",
                    "arn:aws:ec2:${data.aws_region.current.name}:216987438199:subnet/${var.private_subnet_ids[1]}"
                ],
                "ec2:AuthorizedService": "codebuild.amazonaws.com"
            }
        }
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:*"
      ],
      "Resource": [
        "${aws_s3_bucket.ci_bucket.arn}",
        "${aws_s3_bucket.ci_bucket.arn}/*",
        "${data.aws_s3_bucket.terraform_backend.arn}",
        "${data.aws_s3_bucket.terraform_backend.arn}/personal-finance.tfstate"
      ]
    }
  ]
}
POLICY
}

# Allow CodeBuild to invoke other AWS services
data "aws_iam_policy" "managed_policy_codebuild" {
  arn = "arn:aws:iam::aws:policy/AWSCodeBuildDeveloperAccess"
}
data "aws_iam_policy" "managed_policy_ecr_pusher" {
  arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryPowerUser"
}
resource "aws_iam_role_policy_attachment" "codebuild_role_policy_attachment_1" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = data.aws_iam_policy.managed_policy_codebuild.arn
}
resource "aws_iam_role_policy_attachment" "codebuild_role_policy_attachment_2" {
  role       = aws_iam_role.codebuild_role.name
  policy_arn = data.aws_iam_policy.managed_policy_ecr_pusher.arn
}

resource "aws_security_group" "crypto" {
  vpc_id = var.vpc_id
  name   = "${var.app_name}-ci-sg"
  tags = {
    Name = var.app_name
  }
  description = "${var.app_name} SG"
  egress {
    from_port = 0
    to_port   = 65535
    # All outbound traffic
    protocol = "TCP"
    cidr_blocks = [
    "0.0.0.0/0"]
  }
  ingress {
    from_port = 433
    to_port   = 433
    # All output HTTPs traffic
    protocol = "TCP"
    cidr_blocks = [
    "0.0.0.0/0"]
  }
}

resource "aws_codebuild_project" "build" {
  name          = "${var.app_name}-build"
  description   = "test_codebuild_project"
  build_timeout = "5"
  service_role  = aws_iam_role.codebuild_role.arn

  artifacts {
    type = "CODEPIPELINE"
  }
  cache {
    type     = "S3"
    location = aws_s3_bucket.ci_bucket.bucket
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
      name  = "SOME_KEY1"
      value = "SOME_VALUE1"
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
      stream_name = "build"
    }

    s3_logs {
      status   = "ENABLED"
      location = "${aws_s3_bucket.ci_bucket.id}/build-log"
    }
  }

  //  source {
  //    type = "GITHUB"
  //    location = "https://github.com/mitchellh/packer.git"
  //    git_clone_depth = 1
  //  }

  source {
    type      = "CODEPIPELINE"
    buildspec = "buildspec.yml"
  }

  vpc_config {
    vpc_id = var.vpc_id

    # Always choose private subnets here
    # See https://docs.aws.amazon.com/codebuild/latest/userguide/vpc-support.html
    # "When you set up your CodeBuild projects to access your VPC, choose private subnets only."
    subnets = var.private_subnet_ids

    security_group_ids = [
      aws_security_group.crypto.id,
    ]
  }

  tags = {
    Environment = "Test"
  }
}
