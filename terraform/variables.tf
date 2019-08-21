variable "aws_region" {
  default = "us-east-1"
}

variable "version_tag" {
  description = "The version of the Docker Images to pull from ECR"
}


variable "domain_name" {
  description = "The domain name to use for the whole stack. This will be used to create a Route 53 record and many other resources depend on it"
}
variable "cluster_name" {
  default = "cluster-name"
  description = "The name of the cluster"
}
variable "route53_delegation_set_id" {
  # us-east-1 nameservers set ID: N35YEF3QZNEHLQ
  default = "N35YEF3QZNEHLQ"
  description = "A delegation set, previously created using the 'aws_route53_delegation_set' resource. Make sure all domains are pointed to the nameservers of this delegation set"
}

# VPC perring between the app's VPC and the RDS
variable "vpc_perring_owner_id" {
  default = "216987438199"
}
variable "vpc_peering_vpc_id" {
  default = "vpc-24d08740"
}

# MySQL credentials
variable "MYSQL_HOST" {}
variable "MYSQL_DB" {}
variable "MYSQL_USER" {}
variable "MYSQL_PASSWORD" {}
