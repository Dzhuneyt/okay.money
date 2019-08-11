# TODO: Split the task definitions for backend, frontend, nginx

data "template_file" "task_definition__nginx" {
  template = file("${path.module}/task_definitions/nginx.json")

  vars = {
    image_url      = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/nginx:latest"
    container_name = "nginx"

    log_group_region = data.aws_region.current.name
    log_group_name   = aws_cloudwatch_log_group.app.name
  }
}

data "template_file" "task_definition__backend" {
  template = file("${path.module}/task_definitions/backend.json")

  vars = {
    image_url      = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/backend:latest"
    container_name = "backend"

    log_group_region = data.aws_region.current.name
    log_group_name   = aws_cloudwatch_log_group.app.name
  }
}

data "template_file" "task_definition__frontend" {
  template = file("${path.module}/task_definitions/frontend.json")

  vars = {
    image_url      = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/frontend:latest"
    container_name = "frontend"

    log_group_region = data.aws_region.current.name
    log_group_name   = aws_cloudwatch_log_group.app.name
  }
}

resource "aws_ecs_task_definition" "nginx" {
  family                = local.ecs_cluster_name
  container_definitions = data.template_file.task_definition__nginx.rendered
  network_mode          = "awsvpc"
  //  execution_role_arn    = aws_iam_role.ecs_instance.arn
  depends_on = [
    aws_ecs_task_definition.frontend,
    aws_ecs_task_definition.backend
  ]
}
resource "aws_ecs_task_definition" "backend" {
  family                = local.ecs_cluster_name
  container_definitions = data.template_file.task_definition__backend.rendered
  network_mode          = "awsvpc"
  //  execution_role_arn    = aws_iam_role.ecs_instance.arn
}
resource "aws_ecs_task_definition" "frontend" {
  family                = local.ecs_cluster_name
  container_definitions = data.template_file.task_definition__frontend.rendered
  network_mode          = "awsvpc"
  //  execution_role_arn    = aws_iam_role.ecs_instance.arn
}

resource "aws_ecs_service" "nginx" {
  name                               = "${local.ecs_cluster_name}_nginx"
  cluster                            = aws_ecs_cluster.ecs_cluster.id
  task_definition                    = aws_ecs_task_definition.nginx.arn
  desired_count                      = "1"
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  network_configuration {
    # This needs to match the value defined in aws_alb.main.subnets
    # See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html#load-balancing-considerations

    # TODO See if this part is valid:
    # "Only private subnets are supported for the awsvpc network mode. Because tasks do not receive public IP addresses, a NAT gateway is required for outbound internet access, and inbound internet traffic should be routed through a load balancer."
    # Experiment with NAT gateway to see if it's true
    subnets = aws_subnet.public_subnets.*.id
  }
  //  iam_role = aws_iam_role.ecs-service-role.arn

  load_balancer {
    # Register the ECS service within the ALB target group
    # This makes the service participate in health checks
    # and receive traffic when healthy
    target_group_arn = aws_alb_target_group.http_target_group.id
    container_name   = "nginx"
    container_port   = "80"
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.service_discovery.arn
    container_name = "nginx"
    container_port = "80"
  }

  depends_on = [
    aws_alb_listener.http_traffic,
  ]
}
resource "aws_ecs_service" "backend" {
  name                               = "${local.ecs_cluster_name}_backend"
  cluster                            = aws_ecs_cluster.ecs_cluster.id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = "1"
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  network_configuration {
    # This needs to match the value defined in aws_alb.main.subnets
    # See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html#load-balancing-considerations
    subnets = aws_subnet.public_subnets.*.id
  }
  //  iam_role = aws_iam_role.ecs-service-role.arn

  //  load_balancer {
  //    # Register the ECS service within the ALB target group
  //    # This makes the service participate in health checks
  //    # and receive traffic when healthy
  //    target_group_arn = aws_alb_target_group.test.id
  //    container_name = "backend"
  //    container_port = "80"
  //  }

  service_registries {
    registry_arn   = aws_service_discovery_service.service_discovery.arn
    container_name = "backend"
    container_port = 81
  }

  depends_on = [
    aws_alb_listener.http_traffic,
  ]
}
resource "aws_ecs_service" "frontend" {
  name                               = "${local.ecs_cluster_name}_frontend"
  cluster                            = aws_ecs_cluster.ecs_cluster.id
  task_definition                    = aws_ecs_task_definition.frontend.arn
  desired_count                      = "1"
  deployment_minimum_healthy_percent = 50
  deployment_maximum_percent         = 200
  network_configuration {
    # This needs to match the value defined in aws_alb.main.subnets
    # See: https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html#load-balancing-considerations
    subnets = aws_subnet.public_subnets.*.id
  }
  //  iam_role = aws_iam_role.ecs-service-role.arn

  //  load_balancer {
  //    # Register the ECS service within the ALB target group
  //    # This makes the service participate in health checks
  //    # and receive traffic when healthy
  //    target_group_arn = aws_alb_target_group.test.id
  //    container_name = "nginx"
  //    container_port = "80"
  //  }

  service_registries {
    registry_arn   = aws_service_discovery_service.service_discovery.arn
    container_name = "frontend"
    container_port = 82
  }

  depends_on = [
    aws_alb_listener.http_traffic,
  ]
}
