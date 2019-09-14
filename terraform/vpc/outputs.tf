output "vpc_id" {
  value = module.vpc.vpc_id
}
output "nat_public_ip" {
  value = aws_eip.nat_eip[0].public_ip
}
output "public_subnets" {
  value = module.vpc.public_subnets
}
output "private_subnets" {
  value = module.vpc.private_subnets
}
