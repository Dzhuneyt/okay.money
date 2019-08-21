output "alb_dns_a_record" {
  value = aws_alb.main.dns_name
}
output "alb_public_url" {
  value = "http://${aws_alb.main.dns_name}/"
}
output "vpc_id" {
  # Output the newly created VPC ID
  value = module.vpc.vpc_id
}
output "domain_name" {
  value = var.domain_name
}
output "nat_gateway_public_ips" {
  # IP with which ECS services communicate to the outside world
  value = module.vpc.nat_public_ips
}
