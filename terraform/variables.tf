variable "aws_region" {
  default = "us-east-1"
}

variable "vpc_id" {
  # Existing eu-west-1 VPC
  default = "vpc-08f31734bde2cf694"
}
variable "public_subnets" {
  type = list(string)
  default = [
    "subnet-0a2c6710c899437b0",
    "subnet-0511293a2f9fef5da",
  ]
}
variable "private_subnets" {
  type = list(string)
  default = [
    "subnet-07d9a78dd710abce4",
    "subnet-03ed8bfbae98c3058",
  ]
}
variable "vpc_nat_gateway_public_ip" {
  default     = "54.76.222.150"
  description = "The EIP that the NAT gateway was assigned (the gateway attached to private subnets, allowing them to communicate with the outside world)"
}

variable "version_tag" {
  description = "The version of the Docker Images to pull from ECR"
}
variable "domain_name" {
  description = "The domain name to use for the whole stack. This will be used to create a Route 53 record and many other resources depend on it"
}
variable "cluster_id" {
  description = "Run the app within this cluster"
}
variable "cluster_security_group_for_ec2_instances" {
  description = "The security group that the cluster created for its EC2 instances"
  default     = "sg-0eca59f4a1ec0300f"
}

# MySQL credentials
variable "MYSQL_HOST" {}
variable "MYSQL_DB" {}
variable "MYSQL_USER" {}
variable "MYSQL_PASSWORD" {}
