provider "aws" {
  region = var.aws_region
}
data "aws_region" "current" {

}
module "ecs_cluster" {
  providers = {
    aws = aws
  }
  source       = "github.com/Dzhuneyt/Terraform-Module-AWS-ECS-Cluster?ref=v1.0.5"
  create_vpc   = false
  aws_region   = var.aws_region
  cluster_name = var.cluster_name
  subnet_ids   = module.vpc.public_subnets
  # Not needed to access EC2 instances for now
  ssh_key_name           = ""
  vpc_id                 = module.vpc.vpc_id
  instance_type_spot     = "t3a.micro"
  min_spot_instances     = "6"
  max_spot_instances     = "10"
  min_ondemand_instances = "0"
  max_ondmand_instances  = "0"
  spot_bid_price         = "0.0031"
  # 0.0122 for t3a.medium
}

# Allow traffic from the ALB to apps within the cluster
resource "aws_security_group_rule" "allow_alb_traffic_to_apps" {
  from_port                = 0
  protocol                 = "-1"
  security_group_id        = module.ecs_cluster.security_group_for_ec2_instances
  source_security_group_id = module.personal_finance.security_group_alb_id
  to_port                  = 0
  type                     = "ingress"
}

module "personal_finance" {
  providers = {
    aws = aws
  }
  source          = "./app"
  cluster_id      = module.ecs_cluster.cluster_id
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets

  MYSQL_DB       = var.MYSQL_DB
  MYSQL_HOST     = var.MYSQL_HOST
  MYSQL_PASSWORD = var.MYSQL_PASSWORD
  MYSQL_USER     = var.MYSQL_USER

  domain_name = var.domain_name
  version_tag = var.version_tag
  vpc_id      = module.vpc.vpc_id
}

module "vpc" {
  providers = {
    aws = aws
  }
  source = "terraform-aws-modules/vpc/aws"

  name = var.cluster_name
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

  enable_nat_gateway = true
  enable_vpn_gateway = false
  single_nat_gateway = true

  tags = {
    Name = var.cluster_name
  }
}

module "rds" {
  source = "./modules/rds"
  allowed_ingress_ips = [
    "${module.vpc.nat_public_ips[0]}/32"
  ]
}
module "ci" {
  source          = "./ci"
  private_subnets = module.vpc.private_subnets
  public_subnets  = module.vpc.public_subnets
  vpc_id          = module.vpc.vpc_id
  providers = {
    aws = aws
  }
}
