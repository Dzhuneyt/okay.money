resource "aws_security_group" "sg_ci" {
  vpc_id      = var.vpc_id
  name_prefix = "${var.tag}-ci-sg-"
  tags = {
    Name = var.tag
  }
  description = "${var.tag} SG for CodeBuild"
  egress {
    from_port = 0
    to_port   = 65535
    # All outbound traffic
    protocol = "TCP"
    cidr_blocks = [
    "0.0.0.0/0"]
  }
  ingress {
    from_port = 433
    to_port   = 433
    # All output HTTPs traffic
    protocol = "TCP"
    cidr_blocks = [
    "0.0.0.0/0"]
  }
  lifecycle {
    create_before_destroy = true
  }
}
