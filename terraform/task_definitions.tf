# TODO: Split the task definitions for backend, frontend, nginx

data "template_file" "task_definition__nginx" {
  template = file("${path.module}/task_definitions/task_definitions.json")

  vars = {
    nginx_image_url = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/nginx:latest"
    frontend_image_url = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/frontend:latest"
    backend_image_url = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/backend:latest"
    container_name = local.ecs_cluster_name

    log_group_region = data.aws_region.current.name
    log_group_name = aws_cloudwatch_log_group.app.name
  }
}

resource "aws_ecs_task_definition" "nginx" {
  family = local.ecs_cluster_name
  container_definitions = data.template_file.task_definition__nginx.rendered
}

resource "aws_ecs_service" "nginx" {
  name = "${local.ecs_cluster_name}_nginx"
  cluster = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.nginx.arn
  desired_count = "1"
  iam_role = aws_iam_role.ecs-service-role.arn

  load_balancer {
    # Register the ECS service within the ALB target group
    # This makes the service participate in health checks
    # and receive traffic when healthy
    target_group_arn = aws_alb_target_group.test.id
    container_name = "nginx"
    container_port = "80"
  }

  depends_on = [
    aws_alb_listener.front_end,
  ]
}
