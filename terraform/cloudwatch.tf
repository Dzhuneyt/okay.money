## CloudWatch Logs

resource "aws_cloudwatch_log_group" "ecs" {
  name = "${local.ecs_cluster_name}-ecs"
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "${local.ecs_cluster_name}-app"
  retention_in_days = 60
}
resource "aws_cloudwatch_log_group" "nginx" {
  name              = "${local.ecs_cluster_name}-nginx"
  retention_in_days = 60
}
resource "aws_cloudwatch_log_group" "frontend" {
  name              = "${local.ecs_cluster_name}-frontend"
  retention_in_days = 60
}
resource "aws_cloudwatch_log_group" "backend" {
  name              = "${local.ecs_cluster_name}-backend"
  retention_in_days = 60
}
