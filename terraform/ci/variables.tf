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
