# Define some variables we'll use later.
locals {
  instance_type = "t3a.micro"
  spot_price = "0.003"
  key_name = "Scava Ubuntu PC id_rsa"

  # Alphanumeric and dash allowed
  ecs_cluster_name = "Personal-Finance"

  max_spot_instances = 4
  min_spot_instances = 2

  max_ondemand_instances = 3
  min_ondemand_instances = 1

  # TODO Define also the AZs here (hardcoded) because sometimes Terraform creates 2 subnets in the same AZ and a Load balancer can not be attached to such thing
  public_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24",
    "10.0.4.0/24"]
}
