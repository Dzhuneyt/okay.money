variable "tag" {
  default = "PersonalFinance"
}
variable "vpc_id" {}

variable "public_subnets" {
  type = list(string)
}
variable "private_subnets" {
  type = list(string)
}
variable "region" {
  description = "AWS region where to launch the CI elements"
  default     = "eu-west-1"
}
