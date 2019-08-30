data "aws_iam_policy_document" "terraform_policy" {
  statement {
    # Allow CloudWatch to start the Pipeline
    actions = [
      "codepipeline:StartPipelineExecution"
    ]
    resources = [
      aws_codepipeline.codepipeline.arn
    ]
  }
}
resource "aws_iam_policy" "terraform_policy" {
  name_prefix = "${var.tag}-terraform-"
  policy      = data.aws_iam_policy_document.cloudwatch_ci_iam_policy.json
}
