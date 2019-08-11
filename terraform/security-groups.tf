# Create a Security Group with SSH access from the world
resource "aws_security_group" "sg_for_ec2_instances" {
  name_prefix = "${local.ecs_cluster_name}_sg_for_ec2_instances_"
  description = "Security group that allows incoming HTTP and SSH traffic to EC2 instances within the cluster called ${local.ecs_cluster_name}"
  vpc_id      = data.aws_vpc.default.id

  # Allow SSH
  ingress {
    from_port = 22
    to_port   = 22
    protocol  = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  # Allow HTTP
  ingress {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  # Allow all HTTP traffic from the Load Balancer in the ephemeral (Docker) port range
  # This allows the ALB to call Docker Containers that run within the EC2 instances and have
  # exposed some ports in the ephemeral range of that EC2 instance
  ingress {
    from_port = 32768
    to_port   = 61000
    protocol  = "tcp"
    security_groups = [
      aws_security_group.sg_for_alb.id
    ]
  }

  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
    "0.0.0.0/0"]
    prefix_list_ids = []
  }

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = local.ecs_cluster_name
  }
}

resource "aws_security_group" "sg_for_alb" {
  name_prefix = "${local.ecs_cluster_name}_sg_for_alb"
  description = "A security group for the Application Load Balancer. Allows HTTP traffic in"
  vpc_id      = data.aws_vpc.default.id

  # Allow HTTP traffic from any IP
  ingress {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  # Allow the ALB to communicate with any other resource within AWS (and the internet)
  egress {
    from_port = 0
    to_port   = 0
    protocol  = "-1"
    cidr_blocks = [
    "0.0.0.0/0"]
    prefix_list_ids = []
  }

  tags = {
    Name = local.ecs_cluster_name
  }

  lifecycle {
    create_before_destroy = true
  }
}
