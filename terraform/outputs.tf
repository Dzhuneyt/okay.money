output "alb_public_url" {
  value = "http://${aws_alb.main.dns_name}/"
}
output "vpc_id" {
  # Output the newly created VPC ID
  value = "${aws_vpc.main.id} with CIDR block ${aws_vpc.main.cidr_block}"
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
output "dns_zone_nameservers" {
  value = aws_route53_zone.domain.name_servers
}
output "nat_gateway_public_ip" {
  value = "IP with which ECS services communicate to the outside world: ${aws_nat_gateway.gw.public_ip}"
}

output "security_group_alb" {
  value = "ID of security group of the ALB: ${aws_security_group.sg_for_alb.id}"
}
output "security_group_ec2" {
  value = "ID of security group of the EC2 instances: ${aws_security_group.sg_for_ec2_instances.id}"
}
output "security_group_apps" {
  value = "ID of security group of the apps within the cluster: ${aws_security_group.sg_for_ecs_apps.id}"
}
