resource "aws_route_table" "route_table" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "${local.ecs_cluster_name}_route_table"
  }
}
resource "aws_route_table" "route_table_private" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "172.31.0.0/16"
    # RDS VPC CIDR
    vpc_peering_connection_id = aws_vpc_peering_connection.foo.id
  }
  route {
    cidr_block = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.gw.id
  }

  tags = {
    Name = "${local.ecs_cluster_name}_route_table_private"
  }
}

# Associate the subnets with the Route Table + Internet Gateway
resource "aws_route_table_association" "vpc-route-table-association-public" {
  route_table_id = aws_route_table.route_table.id
  count = length(local.public_subnets)

  subnet_id = aws_subnet.public_subnets.*.id[count.index]
}

resource "aws_route_table_association" "vpc-route-table-association-private" {
  route_table_id = aws_route_table.route_table_private.id
  count = length(local.private_subnets)

  subnet_id = aws_subnet.private_subnet.*.id[count.index]
}
