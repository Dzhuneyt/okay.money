# Create a service discovery where ECS tasks will be registered
# and will be able to talk to each other
resource "aws_service_discovery_private_dns_namespace" "example" {
  name        = "example.terraform.local"
  description = "example"
  vpc         = aws_vpc.main.id
}
resource "aws_service_discovery_service" "service_discovery" {
  name = local.ecs_cluster_name
  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.example.id
    routing_policy = "MULTIVALUE"
    dns_records {
      ttl = 10
      type = "A"
    }

    dns_records {
      ttl = 10
      type = "SRV"
    }
  }
  health_check_custom_config {
    failure_threshold = 5
  }
}
