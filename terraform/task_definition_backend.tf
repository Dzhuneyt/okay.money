data "template_file" "task_definition__backend" {
  template = file("${path.module}/task_definitions/backend.json")

  vars = {
    image_url      = "216987438199.dkr.ecr.us-east-1.amazonaws.com/finance/backend:${var.version_tag}"
    container_name = "backend"

    log_group_region = data.aws_region.current.name
    log_group_name   = aws_cloudwatch_log_group.backend.name

    MYSQL_HOST     = var.MYSQL_HOST
    MYSQL_DB       = var.MYSQL_DB
    MYSQL_USER     = var.MYSQL_USER
    MYSQL_PASSWORD = var.MYSQL_PASSWORD
  }
}
resource "aws_ecs_task_definition" "backend" {
  family                = local.ecs_cluster_name
  container_definitions = data.template_file.task_definition__backend.rendered
  network_mode          = local.network_mode
}
resource "aws_ecs_service" "backend" {
  name                               = "${local.ecs_cluster_name}_backend"
  cluster                            = module.ecs_cluster.cluster_id
  task_definition                    = aws_ecs_task_definition.backend.arn
  desired_count                      = "2"
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 300
  network_configuration {
    subnets = aws_subnet.private_subnet.*.id
    security_groups = [
    aws_security_group.sg_for_ecs_apps.id]
  }

  load_balancer {
    # Register the ECS service within the ALB target group
    # This makes the service participate in health checks
    # and receive traffic when healthy
    target_group_arn = aws_alb_target_group.target_group_backend.arn
    container_name   = "backend"
    container_port   = "80"
  }

  service_registries {
    registry_arn   = aws_service_discovery_service.backend.arn
    container_name = "backend"
    container_port = 80
  }
  depends_on = [
    aws_alb.main
  ]
}
resource "aws_service_discovery_service" "backend" {
  name = "backend"
  dns_config {
    namespace_id   = module.ecs_cluster.service_discovery_id
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
