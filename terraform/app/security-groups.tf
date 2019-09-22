resource "aws_security_group" "sg_for_ecs_apps" {
  name_prefix = "${var.app_name}_${var.env_name}_sg_for_ecs_apps_"
  description = "Security group that allows incoming HTTP/HTTPS traffic and ALB traffic to the ECS tasks within the cluster"
  vpc_id      = var.vpc_id

  # Allow HTTP
  ingress {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }
  # Allow HTTPS
  ingress {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  # Allow all HTTP traffic from the Load Balancer in the ephemeral (Docker) port range
  # This allows the ALB to call Docker Containers that run within the EC2 instances and have
  # exposed some ports in the ephemeral range of that EC2 instance
  ingress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    security_groups = [
      aws_security_group.sg_for_alb.id
    ]
  }

  # Allow egresss network
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
    "0.0.0.0/0"]
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = var.app_name
  }
}

resource "aws_security_group" "sg_for_alb" {
  name_prefix = "${var.app_name}_${var.env_name}_sg_for_alb_"
  description = "A security group for the Application Load Balancer. Allows HTTP traffic in"
  vpc_id      = var.vpc_id

  # Allow HTTP/HTTPS traffic from any IP
  ingress {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }
  ingress {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidr_blocks = [
      "0.0.0.0/0",
    ]
  }

  # Allow the ALB to communicate with any other resource within AWS (and the internet)
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
    "0.0.0.0/0"]
  }

  tags = {
    Name = var.app_name
  }

  lifecycle {
    create_before_destroy = true
  }
}
