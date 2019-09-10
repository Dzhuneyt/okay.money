module "vpc" {
  providers = {
    aws = aws
  }
  source = "terraform-aws-modules/vpc/aws"

  name = var.tag
  cidr = "10.0.0.0/16"

  map_public_ip_on_launch = true
  azs                     = data.aws_availability_zones.available.names
  private_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
  ]
  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24"
  ]

  enable_nat_gateway = false
  enable_vpn_gateway = false
  single_nat_gateway = true

  tags = {
    Name = var.tag
  }
}

//resource "aws_route" "my_nat_instance" {
//  count = length(module.vpc.private_route_table_ids)
//  route_table_id = module.vpc.private_route_table_ids[count.index]
//  destination_cidr_block = "0.0.0.0/0"
//  instance_id = aws_instance.nat.id
//}
//
//
//resource "aws_security_group" "nat" {
//  name_prefix = "${var.tag}-nat-"
//  description = "Allow nat traffic"
//  vpc_id = module.vpc.vpc_id
//
//  ingress {
//    from_port = 0
//    to_port = 0
//    protocol = "-1"
//    cidr_blocks = [
//      "0.0.0.0/0"]
//  }
//
//  egress {
//    from_port = 0
//    to_port = 0
//    protocol = "-1"
//    cidr_blocks = [
//      "0.0.0.0/0"]
//  }
//}
//
//data "aws_ami" "nat" {
//  most_recent = true
//
//  filter {
//    name = "name"
//    values = [
//      "amzn-ami-vpc-nat*"]
//  }
//
//  owners = [
//    "amazon"]
//}
//
//resource "aws_instance" "nat" {
//  ami = data.aws_ami.nat.id
//  instance_type = "t3.micro"
//  source_dest_check = false
//  key_name = aws_key_pair.dell_g5_laptop.key_name
//  subnet_id = module.vpc.public_subnets[0]
//  vpc_security_group_ids = [
//    aws_security_group.nat.id
//  ]
//  monitoring = false
//  tags = {
//    Name = var.tag
//    Terraform = "true"
//    NatGateway = "true"
//  }
//
//  lifecycle {
//    create_before_destroy = true
//  }
//}
//
//resource "aws_eip" "nat_eip" {
//  instance = aws_instance.nat.id
//  vpc = true
//  depends_on = [
//    "aws_instance.nat"]
//}
//
//resource "aws_key_pair" "dell_g5_laptop" {
//  key_name_prefix = "Dell G5 Ubuntu"
//  public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDPDM4/Pg3kcI9MydcbG300Przux/ejl6N5/3eN/ok7a543bE7Xjtk5JYxFnTQAwlX1UuIrB6mwkfc0CRgRonbneRQkii3bZMKXayJTbvAf3C4ws96PSyXqmI+Jr6BBlVBcwJWh4RWoSaicN6KPEHevbQSGFOQv5Y5YW5473NzJoYZ4afwaJOd8K7Lr/Fwn6f2lRMj1RyZxoIyTKl74qD4dQ6audKdHJp8UvPhXj2BzWC88lUhu6CA2omSmCeUHnA1i0B2IFCo6N7PF0ZXY+D+AncXJaGIRsBzCi3MtLL/z0sooLlKwaWmQ701C71RuJVa/5OGKAvShPkHLdCIJb3F7i/kK5uhqlecy5YtjYFecL+LYWKyaQGlZ+PZallLW+6VRLaVkAzw+AobcPlmnZx0V9LgoQheRy14RytB7JEyfE0JfD3F/EP72Cix0IGz3nYoeng16/5AZ9QotRuSYlGoducozMpXiHrzeAlRlUkvLTNTKUz+CHypyC4zwKU2ZQdObbHlSn+MRrLF/xYw1t4ZsG6GxpsfzWabACjjrgnXhzDDkr8DfJZUeAWvji/KB5DGPNNhOwQrl1ZWRfU2gmmkm01TH/iLtRdcCR/iUkQ9EpP1zdlnZ9Qb/5zH4cH3JW/JtfmROPaWycRcsVK6evI20ldFAX1s7/WRAqLVrJvyJWw== dzhuneyt@dzhuneyt.com"
//}
