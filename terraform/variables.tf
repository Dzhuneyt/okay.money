variable "aws_region" {
  default = "eu-west-1"
}
variable "version_tag" {
  description = "The version of the Docker Images to pull from ECR"
}
variable "domain_name" {
  description = "The domain name to use for the whole stack. This will be used to create a Route 53 record and many other resources depend on it"
}
variable "cluster_name" {
  description = "Create an ECS cluster with this name"
  default = "PersonalFinance"
}

variable "vpc_id" {
  default = "vpc-09809706f2f0bff29"
}
variable "private_subnets" {
  type = list(string)
  default = [
    "subnet-0b4ed429b3f0799d4",
    "subnet-0c199cd2ce034e75e",
    "subnet-0484934b7b572a53f",
  ]
}
variable "public_subnets" {
  type = list(string)
  default = [
    "subnet-020fd53c6b427c52c",
    "subnet-091fff00af1346252",
    "subnet-0457587865897e2cc",
  ]
}

# MySQL credentials
variable "MYSQL_HOST" {}
variable "MYSQL_DB" {}
variable "MYSQL_USER" {}
variable "MYSQL_PASSWORD" {}
