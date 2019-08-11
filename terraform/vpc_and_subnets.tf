# Create a VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  tags = {
    Name = local.ecs_cluster_name
  }
}
output "vpc_id" {
  # Output the newly created VPC ID
  value = aws_vpc.main.id
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
    Name = "${local.ecs_cluster_name}-zone-${count.index}"
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
output "subnet_ids" {
  value = data.aws_subnet_ids.all_subnets.ids
}
