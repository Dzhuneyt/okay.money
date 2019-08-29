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

data "aws_region" "current" {}
data "aws_billing_service_account" "main" {}

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

    environment_variable {
      name  = "SOME_KEY1"
      value = "SOME_VALUE1"
    }

    //    environment_variable {
    //      name  = "SOME_KEY2"
    //      value = "SOME_VALUE2"
    //      type  = "PARAMETER_STORE"
    //    }
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
