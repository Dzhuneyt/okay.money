data "aws_iam_policy_document" "terraform_policy" {
  statement {
    actions = [
      "ec2:Describe*",
      "ecs:TagResource",
      "ec2:*Vpc*",
      "ec2:*Subnet*",
      "ec2:*Gateway*",
      "ec2:*Vpn*",
      "ec2:*Route*",
      "ec2:*Address*",
      "ec2:*SecurityGroup*",
      "ec2:*NetworkAcl*",
      "ec2:*DhcpOptions*",
      "ec2:RunInstances",
      "ec2:StopInstances",
      "ec2:StartInstances",
      "ec2:TerminateInstances",
      "iam:AddRoleToInstanceProfile",
      "servicediscovery:CreatePrivateDnsNamespace",
      "servicediscovery:Get*",
      "route53:CreateHostedZone",
    ]
    resources = [
      "*"
    ]
  }

  statement {
    actions = [
      "ec2:AuthorizeSecurityGroupEgress",
      "ec2:AuthorizeSecurityGroupIngress",
      "ec2:DeleteSecurityGroup",
      "ec2:RevokeSecurityGroupEgress",
      "ec2:RevokeSecurityGroupIngress",
      "ec2:CreateTags",
    ]
    resources = [
      "arn:aws:ec2:*:*:security-group/*"
    ]
  }

  statement {
    # Allow Terraform to create new IAM Policies and IAM roles
    actions = [
      "iam:Get*",
      "iam:Create*",
      "iam:TagRole",
      "iam:AttachRolePolicy",
      "iam:CreateInstanceProfile",
      "iam:DeleteInstanceProfile",
      "iam:List*",
      "iam:PassRole",
      "iam:ListEntitiesForPolicy",
    ]
    resources = [
      "arn:aws:iam::*:policy/*",
      "arn:aws:iam::*:role/*",
      "arn:aws:iam::*:instance-profile/${var.tag}*",
    ]
  }

  statement {
    actions = [
    "iam:DeletePolicyVersion"]
    resources = [
    "arn:aws:iam::*:policy/${var.tag}*"]
  }

  statement {
    # Allow people with this policy to manage everything that has the stack tag
    actions = [
      "ec2:*",
      "ecs:*",
      "autoscaling:*",
    ]
    resources = [
      "*"
    ]
    condition {
      test = "StringLike"
      values = [
      var.tag]
      variable = "iam:ResourceTag/Name"
    }
  }

  statement {
    actions = [
      "ecs:Describe*",
      "ecs:CreateCluster",
      "ecs:RegisterTaskDefinition",
    ]
    resources = [
    "*"]
  }
  statement {
    actions = [
      "ecs:UpdateService"
    ]
    resources = [
      "arn:aws:ecs:*:*:service/${var.tag}*"
    ]
  }
  statement {
    actions = [
      "ec2:Describe*",
      "ec2:CreateVpc",
      "ec2:CreateSecurityGroup",
      "autoscaling:Describe*",
      "elasticloadbalancing:Describe*",
      "iam:CreatePolicy",
      "sts:DecodeAuthorizationMessage",
    ]
    resources = [
    "*"]
  }

  statement {
    actions = [
      "autoscaling:*",
    ]
    resources = [
      "arn:aws:autoscaling:*:*:launchConfiguration:*:launchConfigurationName/${var.tag}*",
    ]
  }

  statement {
    actions = [
    "autoscaling:*"]
    resources = [
      "arn:aws:autoscaling:*:*:autoScalingGroup:*:autoScalingGroupName/${var.tag}*"
    ]
  }

  statement {
    actions = [
      "route53:Get*",
      "route53:List*",
    ]
    resources = [
      "*"
    ]
  }

  statement {
    actions = [
      "logs:Describe*",
      "logs:List*",
      "acm:Describe*",
      "acm:List*",
    ]
    resources = [
    "*"]
  }

  statement {
    actions = [
      "codecommit:GetRepository"
    ]
    resources = [
      data.aws_codecommit_repository.test.arn
    ]
  }

  statement {
    actions = [
      "codebuild:*",
      "codepipeline:*",
    ]
    resources = [
      aws_codebuild_project.codebuild_develop_tests.arn,
      aws_codebuild_project.codebuild_deploy_to_ecs.arn,
      aws_codebuild_project.codebuild_develop_push_to_ecr.arn,
      aws_codepipeline.codepipeline_develop.arn,
      aws_codepipeline.codepipeline_master.arn,
    ]
  }

  statement {
    actions = [
      "events:Describe*",
      "events:List*",
    ]
    resources = [
      "*"
    ]
  }

  statement {
    actions = [
      "dynamodb:ListTagsOfResource",
    ]
    resources = [
    "*"]
  }
}
resource "aws_iam_policy" "terraform_policy" {
  name_prefix = "${var.tag}-terraform-ecs-manager-"
  policy      = data.aws_iam_policy_document.terraform_policy.json
}
