## CloudWatch Logs

resource "aws_cloudwatch_log_group" "ecs" {
  name = "${local.ecs_cluster_name}-ecs"
}

resource "aws_cloudwatch_log_group" "app" {
  name = "${local.ecs_cluster_name}-app"
}
