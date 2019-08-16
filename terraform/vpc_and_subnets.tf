# Create a VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = local.ecs_cluster_name
  }
}

# Declare the data source
data "aws_availability_zones" "available" {
  state = "available"
}
# For high availability we need to create multiple subnets
resource "aws_subnet" "public_subnets" {
  vpc_id            = aws_vpc.main.id
  count             = length(local.public_subnets)
  cidr_block        = local.public_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${local.ecs_cluster_name}-publicsubnet-${count.index}"
    Tier = "Public"
  }
}
resource "aws_subnet" "private_subnet" {
  vpc_id            = aws_vpc.main.id
  count             = length(local.private_subnets)
  cidr_block        = local.private_subnets[count.index]
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "${local.ecs_cluster_name}-privatesubnet-${count.index}"
    Tier = "Private"
  }
}

# Set the default vpc
data "aws_vpc" "default" {
  id = aws_vpc.main.id
}

# Read all subnet ids for this vpc/region.
data "aws_subnet_ids" "public_subnet_ids" {
  vpc_id = data.aws_vpc.default.id

  # Get only public subnets
  tags = {
    Tier = "Public"
  }

  # Wait for the subnets to be actually created, not just the VPC
  depends_on = [
    aws_subnet.public_subnets,
  ]
}

