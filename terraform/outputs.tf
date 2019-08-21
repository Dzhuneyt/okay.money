output "vpc_id" {
  # Output the newly created VPC ID
  value = module.vpc.vpc_id
}
output "nat_gateway_public_ips" {
  # IP with which ECS services communicate to the outside world
  value = module.vpc.nat_public_ips
}
