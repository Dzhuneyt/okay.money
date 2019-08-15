# Define some variables we'll use later.
locals {
  instance_type_ondemand = "t3a.micro"
  instance_type_spot     = "t3a.medium"
  spot_price             = "0.0113"
  key_name               = "Dell G5 Ubuntu"

  # Alphanumeric and dash allowed
  ecs_cluster_name = "Personal-Finance"

  max_spot_instances = 10
  min_spot_instances = 7

  max_ondemand_instances = 3
  min_ondemand_instances = 1

  # TODO Define also the AZs here (hardcoded) because sometimes Terraform creates 2 subnets in the same AZ and a Load balancer can not be attached to such thing
  public_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
  ]

  private_subnets = [
    "10.0.10.0/24",
    "10.0.11.0/24",
  ]

  network_mode = "awsvpc"
}
