# Store build logs here and keep them for 14 days
resource "aws_cloudwatch_log_group" "codebuild" {
  name              = "${var.tag}-${var.branch_name}-codebuild"
  retention_in_days = 14
}
