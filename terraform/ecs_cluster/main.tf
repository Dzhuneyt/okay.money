provider "aws" {
  region = var.region
}

module "ecs_cluster" {
  providers = {
    aws = aws
  }
  source       = "github.com/Dzhuneyt/Terraform-Module-AWS-ECS-Cluster?ref=v1.0.3"
  create_vpc   = false
  aws_region   = var.region
  cluster_name = var.tag
  subnet_ids   = var.public_subnets
  # Not needed to access EC2 instances for now
  ssh_key_name           = ""
  vpc_id                 = var.vpc_id
  instance_type_spot     = "t3a.micro"
  min_spot_instances     = "7"
  max_spot_instances     = "10"
  min_ondemand_instances = "0"
  max_ondmand_instances  = "0"
  spot_bid_price         = "0.0031"
  # 0.0122 for t3a.medium
}
