output "security_group_alb_id" {
  value = aws_security_group.sg_for_alb.id
}
output "security_group_apps_id" {
  value = aws_security_group.sg_for_ecs_apps.id
}
output "domain_name" {
  value = var.domain_name
}
output "alb_url" {
  value = aws_alb.main.dns_name
}
