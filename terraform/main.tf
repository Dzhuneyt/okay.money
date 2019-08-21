// https://solidsoftware.io/blog/hybrid-spot-ondemand-ecs-cluster-setup/

provider "aws" {
  region = var.aws_region
}
data "aws_region" "current" {

}
module "ecs_cluster" {
  source = "./modules/ecs_cluster"
  aws_region = var.aws_region
  cluster_name = var.cluster_name
  subnet_ids = module.vpc.public_subnets
  # Not needed to access EC2 instances for now
  ssh_key_name = ""
  vpc_id = module.vpc.vpc_id
  min_spot_instances = "3"
  max_spot_instances = "5"
  min_ondemand_instances = "0"
  max_ondmand_instances = "0"
}

# Allow traffic from the ALB to apps within the cluster
resource "aws_security_group_rule" "allow_alb_traffic_to_apps" {
  from_port = 0
  protocol = "-1"
  security_group_id = module.ecs_cluster.sg_for_ec2_instances
  source_security_group_id = aws_security_group.sg_for_alb.id
  to_port = 0
  type = "ingress"
}

module "vpc" {
  source = "terraform-aws-modules/vpc/aws"

  name = var.cluster_name
  cidr = "10.0.0.0/16"

  azs = [
    data.aws_availability_zones.available.names[0],
    data.aws_availability_zones.available.names[1],
    data.aws_availability_zones.available.names[2],
  ]
  private_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24"]
  public_subnets = [
    "10.0.101.0/24",
    "10.0.102.0/24",
    "10.0.103.0/24"]

  enable_nat_gateway = true
  single_nat_gateway = true
  one_nat_gateway_per_az = false
  enable_dns_hostnames = true

  tags = {
    Terraform = "true"
    Name = var.cluster_name
  }
}
