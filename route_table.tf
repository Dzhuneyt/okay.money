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

# Associate the subnets with the Route Table + Internet Gateway
resource "aws_route_table_association" "vpc-route-table-association" {
  route_table_id = aws_route_table.route_table.id
  count = length(local.public_subnets)

  subnet_id = element(aws_subnet.public_subnets.*.id, count.index)
}
