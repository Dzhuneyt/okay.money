# Store build logs here and keep them for 14 days
resource "aws_cloudwatch_log_group" "codebuild" {
  name              = "${var.tag}-codebuild"
  retention_in_days = 14
}

module "cloudwatch_triggers_codepipeline_develop" {
  source              = "github.com/Dzhuneyt/terraform-cloudwatch-trigger-codepipeline?ref=0.0.2"
  branch_to_monitor   = "develop"
  codecommit_repo_arn = data.aws_codecommit_repository.test.arn
  codepipeline_arn    = aws_codepipeline.codepipeline_develop.arn
  tag                 = var.tag

  providers = {
    aws = aws
  }
}
module "cloudwatch_triggers_codepipeline_master" {
  source              = "github.com/Dzhuneyt/terraform-cloudwatch-trigger-codepipeline?ref=0.0.2"
  branch_to_monitor   = "master"
  codecommit_repo_arn = data.aws_codecommit_repository.test.arn
  codepipeline_arn    = aws_codepipeline.codepipeline_master.arn
  tag                 = var.tag

  providers = {
    aws = aws
  }
}
