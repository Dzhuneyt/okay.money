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
  default     = "cluster-name"
  description = "The name of the cluster"
}

# MySQL credentials
variable "MYSQL_HOST" {}
variable "MYSQL_DB" {}
variable "MYSQL_USER" {}
variable "MYSQL_PASSWORD" {}
