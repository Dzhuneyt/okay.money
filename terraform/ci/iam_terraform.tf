data "aws_iam_policy_document" "terraform_policy" {
  statement {
    actions = [
      "ec2:DescribeAvailabilityZones",
      "ec2:DescribeVpcs",
    ]
    resources = [
      "*"
    ]
  }
}
resource "aws_iam_policy" "terraform_policy" {
  name_prefix = "${var.tag}-terraform-"
  policy      = data.aws_iam_policy_document.terraform_policy.json
}
