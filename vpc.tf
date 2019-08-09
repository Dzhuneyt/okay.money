locals {
  cidr_block = "10.0.0.0/16"
  public_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24"]

  stack_name = "Personal-Finance-Beanstalk"
}

provider "aws" {
  region = "us-east-1"
}
data "aws_region" "current" {

}

# Create a VPC
resource "aws_vpc" "main" {
  cidr_block = local.cidr_block
  enable_dns_hostnames = true
  tags = {
    Name = local.stack_name
  }
}

# Declare the data source
data "aws_availability_zones" "available" {
  state = "available"
}
# For high availability we need to create multiple subnets
resource "aws_subnet" "public_subnets" {
  vpc_id = aws_vpc.main.id
  count = length(local.public_subnets)
  cidr_block = local.public_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${local.stack_name}-${count.index}"
  }
}

# Set the default vpc
data "aws_vpc" "default" {
  id = aws_vpc.main.id
}

# Read all subnet ids for this vpc/region.
data "aws_subnet_ids" "all_subnets" {
  vpc_id = data.aws_vpc.default.id

  # Wait for the subnets to be actually created, not just the VPC
  depends_on = [
    aws_subnet.public_subnets
  ]
}

# Create the internet gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = local.stack_name
  }
}

# Create route table that allows ingress traffic from everywhere
resource "aws_route_table" "route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = local.stack_name
  }
}

# Associate the subnets with the Route Table + Internet Gateway
resource "aws_route_table_association" "vpc-route-table-association" {
  route_table_id = aws_route_table.route_table.id
  count = length(local.public_subnets)
  subnet_id = aws_subnet.public_subnets.*.id[count.index]
}


output "vpc_id" {
  # Output the newly created VPC ID
  value = aws_vpc.main.id
}
output "subnet_ids" {
  value = data.aws_subnet_ids.all_subnets.ids
}
