data "aws_iam_policy_document" "terraform_policy" {
  statement {
    actions = [
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeVpcs",
      "ec2:DescribeImages",
    ]
    resources = [
      "*"
    ]
  }

  statement {
    # Allow people with this policy to manage everything that has the stack tag
    actions = [
      "ec2:DeleteVpc",
      "ec2:ModifyVpcAttribute",
      "ecs:DescribeClusters",
    ]
    resources = [
    "*"]
    condition {
      test = "StringLike"
      values = [
      var.tag]
      variable = "iam:ResourceTag/Name"
    }
  }
  statement {
    actions = [
      "ec2:Describe*",
      "ec2:CreateVpc",
      "ec2:CreateSecurityGroup",
      "iam:CreatePolicy",
      "ecs:CreateCluster",
      "sts:DecodeAuthorizationMessage",
    ]
    resources = [
    "*"]
  }
}
resource "aws_iam_policy" "terraform_policy" {
  name_prefix = "${var.tag}-terraform-"
  policy      = data.aws_iam_policy_document.terraform_policy.json
}
