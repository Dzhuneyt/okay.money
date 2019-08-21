variable "cluster_name" {}
variable "aws_region" {}
variable "vpc_id" {
  type = "string"
}
variable "ssh_key_name" {}
variable "instance_type_spot" {
  default = "t3a.medium"
}
variable "instance_type_ondemand" {
  default = "t3a.micro"
}
variable "spot_bid_price" {
  default = "0.0128"
}

variable "min_spot_instances" {
  default = "1"
}
variable "max_spot_instances" {
  default = "1"
}
variable "min_ondemand_instances" {
  default = "0"
}
variable "max_ondmand_instances" {
  default = "0"
}
variable "subnet_ids" {
  description = "A list of subnet IDs to launch EC2 instances in"
  type        = list(string)
}
variable "create_iam_service_linked_role" {
  default     = "false"
  description = "Whether or not to create a service-linked role for ECS inside your AWS account. Such role is automatically created the first time you provision an ECS cluster using the AWS UI, CLI, Terraform, etc. If you previously created an ECS cluster, set this to false, else set it to true"
}
