output "alb_public_url" {
  value = "http://${aws_alb.main.dns_name}/"
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
