resource "aws_nat_gateway" "gw" {
  allocation_id = aws_eip.ip_for_nat_gateway.id

  # Add the NAT gateway into the first available public subnet
  # Because it's an internet facing component after all.
  # If redundancy is needed in the future, we need to create 1 NAT gateway per AZ
  subnet_id = aws_subnet.public_subnets[0].id

  tags = {
    Name = var.cluster_name
  }
}
resource "aws_eip" "ip_for_nat_gateway" {
}
