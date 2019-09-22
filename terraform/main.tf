provider "aws" {
  region = var.aws_region
}


// Cluster now centralized
//module "ecs_cluster" {
//  providers = {
//    aws = aws
//  }
//  source = "github.com/Dzhuneyt/Terraform-Module-AWS-ECS-Cluster?ref=v1.0.5"
//  create_vpc = false
//  aws_region = var.aws_region
//  cluster_name = var.cluster_name
//  subnet_ids = var.public_subnets
//  # Not needed to access EC2 instances for now
//  ssh_key_name = ""
//  vpc_id = var.vpc_id
//  instance_type_spot = "t3a.nano"
//  min_spot_instances = "7"
//  max_spot_instances = "10"
//  min_ondemand_instances = "0"
//  max_ondmand_instances = "0"
//  spot_bid_price = "0.0031"
//  # 0.0122 for t3a.medium
//}

# Allow traffic from the ALB to apps within the cluster
resource "aws_security_group_rule" "allow_alb_traffic_to_apps" {
  from_port                = 0
  protocol                 = "-1"
  security_group_id        = local.ecs_security_group_for_ec2_instances
  source_security_group_id = module.personal_finance.security_group_alb_id
  to_port                  = 0
  type                     = "ingress"
}

module "personal_finance" {
  providers = {
    aws = aws
  }
  source          = "./app"
  cluster_id      = local.cluster_id
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  MYSQL_DB       = var.MYSQL_DB
  MYSQL_HOST     = var.MYSQL_HOST
  MYSQL_PASSWORD = var.MYSQL_PASSWORD
  MYSQL_USER     = var.MYSQL_USER

  domain_name = var.domain_name
  version_tag = var.version_tag
  vpc_id      = var.vpc_id
}

// VPC management moved to centralized repo
//module "vpc" {
//  source = "./vpc"
//  cluster_name = var.cluster_name
//
//  providers = {
//    aws = aws
//  }
//}


//locals {
//  //  nat_gateway_public_ip = module.vpc.nat_public_ip
//  nat_gateway_public_ip = "52.50.225.170"
//  //module.vpc.nat_public_ips[0]
//}

// No longer needed because VPC management is now centralized (including VPC to RDS connectivity)
//module "rds" {
//  source = "./modules/rds"
//  allowed_ingress_ips = [
//    "${local.nat_gateway_public_ip}/32"
//  ]
//}
//module "ci" {
//  source = "./ci"
//  private_subnets = var.private_subnets
//  public_subnets = var.public_subnets
//  vpc_id = var.vpc_id
//  providers = {
//    aws = aws
//  }
//}
