module "vpc" {
  providers = {
    aws = aws
  }
  source = "terraform-aws-modules/vpc/aws"

  name = var.cluster_name
  cidr = "10.0.0.0/16"

  map_public_ip_on_launch = true
  azs = data.aws_availability_zones.available.names
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
    Name = var.cluster_name
  }
}
