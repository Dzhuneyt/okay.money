# ALB

# see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html
resource "aws_alb" "main" {
  name = local.ecs_cluster_name
  subnets = aws_subnet.public_subnets.*.id
  security_groups = [
    aws_security_group.sg_for_alb.id]
  tags = {
    Name = local.ecs_cluster_name
  }
}

resource "aws_alb_target_group" "target_group_frontend" {
  name = "${local.ecs_cluster_name}-frontend"
  port = 80
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id

  # This target_type allows distributing traffic to
  # ECS services within EC2 instances (ECS cluster)
  # This needs to be "ip", not "instance", because:
  # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html
  # See section "Service Load Balancing Considerations"
  target_type = "ip"

  deregistration_delay = 15
}
resource "aws_alb_target_group" "target_group_backend" {
  name = "${local.ecs_cluster_name}-backend"
  port = 80
  protocol = "HTTP"
  health_check {
    path = "/robots.txt"
  }
  vpc_id = aws_vpc.main.id

  # This target_type allows distributing traffic to
  # ECS services within EC2 instances (ECS cluster)
  # This needs to be "ip", not "instance", because:
  # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html
  # See section "Service Load Balancing Considerations"
  target_type = "ip"

  deregistration_delay = 15
}

# Listener for traffic
resource "aws_alb_listener" "http_traffic" {
  # Attach the listener to an actual ALB
  load_balancer_arn = aws_alb.main.id

  # Listens on port 80 ingress
  # Make sure the Security Group associated with the ALB allows this
  port = "80"
  protocol = "HTTP"

  # And forwards everything to a "catch all" ALB group
  default_action {
    type = "forward"
    target_group_arn = aws_alb_target_group.target_group_frontend.id
  }
}

resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_alb_listener.http_traffic.arn
  priority = 100

  action {
    type = "forward"
    target_group_arn = aws_alb_target_group.target_group_backend.arn
  }

  condition {
    field = "path-pattern"
    values = [
      "/v1/*"]
  }
}

output "alb_public_url" {
  value = "http://${aws_alb.main.dns_name}/"
}
