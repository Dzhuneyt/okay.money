output "alb_dns_a_record" {
  value = aws_alb.main.dns_name
}
output "alb_public_url" {
  value = "http://${aws_alb.main.dns_name}/"
}
output "vpc_id" {
  # Output the newly created VPC ID
  value = aws_vpc.main.id
}
output "public_subnet_ids" {
  value = aws_subnet.public_subnets.*.id
}
output "private_subnet_ids" {
  value = aws_subnet.private_subnet.*.id
}
output "domain_name" {
  value = var.domain_name
}
output "nat_gateway_public_ip" {
  # IP with which ECS services communicate to the outside world
  value = aws_nat_gateway.gw.public_ip
}

output "security_group_of_alb" {
  # ID of security group of the ALB
  value = aws_security_group.sg_for_alb.id
}
output "security_group_of_apps" {
  value = aws_security_group.sg_for_ecs_apps.id
}
