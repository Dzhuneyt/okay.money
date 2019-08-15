# Create a service discovery where ECS tasks will be registered
# and will be able to talk to each other
resource "aws_service_discovery_private_dns_namespace" "dns_namespace" {
  name        = "${aws_ecs_cluster.ecs_cluster.name}.local"
  description = "Service discovery for ${aws_ecs_cluster.ecs_cluster.name}"
  vpc         = aws_vpc.main.id
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
resource "aws_service_discovery_service" "backend" {
  name = "backend"
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
resource "aws_service_discovery_service" "nginx" {
  name = "nginx"
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
