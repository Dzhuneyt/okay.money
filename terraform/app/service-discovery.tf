# Create a service discovery where ECS tasks will be registered
# and will be able to talk to each other
resource "aws_service_discovery_private_dns_namespace" "dns_namespace" {
  name        = "${var.app_name}-${var.env_name}.local"
  description = "Service discovery for containers of app ${var.app_name}, environment ${var.env_name}"
  vpc         = var.vpc_id
}
