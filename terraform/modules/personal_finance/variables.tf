variable "app_name" {
  default = "personal-finance"
}
variable "vpc_id" {}
variable "cluster_id" {}
variable "public_subnets" {
  description = "The public subnets which the ALB will target"
}
variable "private_subnets" {
  description = "The private subnets where the apps will be launched in"
}
variable "domain_name" {}
variable "route53_delegation_set_id" {
  # eu-west-1 nameservers set ID: N1EOXW00F403S3
  default     = "N1EOXW00F403S3"
  description = "A delegation set, previously created using the 'aws_route53_delegation_set' resource. Make sure all domains are pointed to the nameservers of this delegation set"
}
variable "version_tag" {
  description = "The version of the Docker Images to pull from ECR"
}
# MySQL credentials
variable "MYSQL_HOST" {}
variable "MYSQL_DB" {}
variable "MYSQL_USER" {}
variable "MYSQL_PASSWORD" {}

