resource "aws_security_group" "nat_instance_sg" {
  description = "Nat instance security group"
  vpc_id = module.vpc.vpc_id
  name = "nat-sg"

  # opens inbound traffic from the Internet for http and https
  ingress {
    protocol = "tcp"
    from_port = 80
    to_port = 80
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  ingress {
    protocol = "tcp"
    from_port = 443
    to_port = 443
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  # opens outbound traffic from the Internet for http and https
  egress {
    protocol = "-1"
    from_port = 0
    to_port = 0
    cidr_blocks = [
      "0.0.0.0/0"]
  }

  tags = {
    Name = "sg-nat"
    Terraform = "true"
  }
}
resource "aws_instance" "nat" {
  count = 1
  //length(data.aws_availability_zones.available.names)
  ami = "ami-5bc6c23d"
  # amzn-ami-vpc-nat-hvm-2017.03.0.20170417-x86_64-ebs
  instance_type = "t2.micro"
  source_dest_check = false
  key_name = "Dell G5 Ubuntu"
  subnet_id = module.vpc.public_subnets[count.index]
  vpc_security_group_ids = [
    aws_security_group.nat_instance_sg.id
  ]
  monitoring = false
  tags = {
    Name = var.cluster_name
    Nat = "true"
    Terraform = "true"
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_eip" "nat_eip" {
  instance = aws_instance.nat.*.id[count.index]
  vpc = true
  count = length(aws_instance.nat.*.id)
  depends_on = [
    "aws_instance.nat"]
}
resource "aws_route" "my_nat_instance" {
  count = length(module.vpc.private_route_table_ids)
  route_table_id = module.vpc.private_route_table_ids[count.index]
  destination_cidr_block = "0.0.0.0/0"
  instance_id = aws_instance.nat.*.id[count.index]
}
//resource "aws_route" "gw" {
//  route_table_id = element(module.vpc.private_route_table_ids,count.index)
//  count = length(module.vpc.private_route_table_ids)
//  destination_cidr_block = "0.0.0.0/0"
//  //  nat_gateway_id = aws_nat_gateway.gw.*.id[count.index%3]
//  nat_gateway_id = "nat-0b6e07fefa2de2569"
//}
