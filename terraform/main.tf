// https://solidsoftware.io/blog/hybrid-spot-ondemand-ecs-cluster-setup/

provider "aws" {
  region = "us-east-1"
}
data "aws_region" "current" {

}

module "route53_delegation_set" {
  source = "./modules/delegation_set"
}
module "ecs_cluster" {
  source = "./modules/ecs_cluster"
  cluster_name = var.cluster_name
  subnet_ids = data.aws_subnet_ids.public_subnet_ids.ids
  ssh_key_name = "Dell G5 Ubuntu"
  vpc_id = aws_vpc.main.id
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
