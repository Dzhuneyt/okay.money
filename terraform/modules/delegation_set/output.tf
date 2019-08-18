output "nameservers" {
  value = aws_route53_delegation_set.main.name_servers
}
output "delegation_set_id" {
  value = aws_route53_delegation_set.main.id
}
