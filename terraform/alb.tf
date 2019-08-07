# ALB

# see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html
resource "aws_alb_target_group" "test" {
  name = "tf-example-ecs-ghost"
  port = 80
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id
}

resource "aws_security_group" "sg_for_alb" {
  name_prefix = "${local.ecs_cluster_name}_sg_for_alb"
  description = "A security group for the Application Load Balancer. Allows HTTP traffic in"
  vpc_id = data.aws_vpc.default.id

  # Allow HTTP traffic from any IP
  ingress {
    protocol = "tcp"
    from_port = 80
    to_port = 80
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  egress {
    from_port = 0
    to_port = 0
    protocol = "-1"
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

resource "aws_alb" "main" {
  name = local.ecs_cluster_name
  subnets = aws_subnet.public_subnets.*.id
  security_groups = [
    aws_security_group.sg_for_alb.id]
  tags = {
    Name = local.ecs_cluster_name
  }
}

# Listener for traffic
resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_alb.main.id

  # Listens on port 80
  port = "80"
  protocol = "HTTP"

  # And forwards everything to a "catch all" ALB group
  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.test.id
  }
}

output "alb_public_url" {
  value = aws_alb.main.dns_name
}
