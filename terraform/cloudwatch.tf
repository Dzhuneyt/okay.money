## CloudWatch Logs
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "${local.ecs_cluster_name}-frontend"
  retention_in_days = 60
}
resource "aws_cloudwatch_log_group" "backend" {
  name              = "${local.ecs_cluster_name}-backend"
  retention_in_days = 60
}
