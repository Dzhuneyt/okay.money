data "template_file" "task_definition__frontend" {
  template = file("${path.module}/task_definitions/frontend.json")

  vars = {
    image_url      = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/frontend:${var.version_tag}"
    container_name = "frontend"

    log_group_region = data.aws_region.current.name
    log_group_name   = aws_cloudwatch_log_group.frontend.name
  }
}

resource "aws_ecs_task_definition" "frontend" {
  family                = var.app_name
  container_definitions = data.template_file.task_definition__frontend.rendered
  network_mode          = "awsvpc"
  depends_on = [
    # Avoid parallel calls that sometimes cause:
    # https://github.com/terraform-providers/terraform-provider-aws/issues/9777
    aws_ecs_task_definition.backend,
  ]
}

resource "aws_ecs_service" "frontend" {
  name                               = "${var.app_name}_frontend"
  cluster                            = var.cluster_id
  task_definition                    = aws_ecs_task_definition.frontend.arn
  desired_count                      = "2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 300
  network_configuration {
    subnets = var.private_subnets
    security_groups = [
    aws_security_group.sg_for_ecs_apps.id]
  }

  load_balancer {
    # Register the ECS service within the ALB target group
    # This makes the service participate in health checks
    # and receive traffic when healthy
    target_group_arn = aws_alb_target_group.target_group_frontend.arn
    container_name   = "frontend"
    container_port   = "80"
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.frontend.arn
    container_name = "frontend"
    container_port = 80
  }

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [
    aws_ecs_service.backend,
  ]
}
resource "aws_service_discovery_service" "frontend" {
  name = "frontend"
  dns_config {
    namespace_id   = aws_service_discovery_private_dns_namespace.dns_namespace.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl  = 10
      type = "A"
    }

    dns_records {
      ttl  = 10
      type = "SRV"
    }
  }
  health_check_custom_config {
    failure_threshold = 5
  }
}
