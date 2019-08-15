output "alb_public_url" {
  value = "http://${aws_alb.main.dns_name}/"
}
output "public_subnet_ids" {
  value = aws_subnet.public_subnets.*.id
}
output "private_subnet_ids" {
  value = aws_subnet.private_subnet.*.id
}
