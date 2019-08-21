## CloudWatch Logs
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "${var.app_name}-frontend"
  retention_in_days = 60
}
resource "aws_cloudwatch_log_group" "backend" {
  name              = "${var.app_name}-backend"
  retention_in_days = 60
}
