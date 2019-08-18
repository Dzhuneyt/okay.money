# ALB

# see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html
resource "aws_alb" "main" {
  name = local.ecs_cluster_name

  access_logs {
    bucket  = aws_s3_bucket.alb_logs.bucket
    prefix  = local.ecs_cluster_name
    enabled = true
  }

  # The ALB will potentially target all possible public subnets and AZs
  subnets = aws_subnet.public_subnets.*.id

  security_groups = [
    # SG that allows incoming traffic to the ALB
    # and the ALB to communicate internally
    # with other resources within the VPC
    aws_security_group.sg_for_alb.id
  ]
  tags = {
    Name = local.ecs_cluster_name
  }

  depends_on = [
    aws_s3_bucket.alb_logs,
    aws_s3_bucket_policy.aws_s3_bucket_policy
  ]
}
resource "aws_s3_bucket" "alb_logs" {
  bucket = local.alb_logs_bucket_name
  acl    = "private"
  # On destroy of stack, delete the bucket even if it has some content
  force_destroy = true

  tags = {
    Name        = local.ecs_cluster_name
    Environment = "Dev"
  }
}
data "aws_elb_service_account" "main" {}
data "template_file" "aws_s3_bucket_policy" {
  template = file("${path.module}/alb_s3_bucket_policy.json")

  vars = {
    BUCKET_NAME            = aws_s3_bucket.alb_logs.bucket
    AWS_SERVICE_ACCOUNT_ID = data.aws_elb_service_account.main.arn
  }
}
resource "aws_s3_bucket_policy" "aws_s3_bucket_policy" {
  bucket = aws_s3_bucket.alb_logs.bucket
  policy = data.template_file.aws_s3_bucket_policy.rendered
}

resource "aws_alb_target_group" "target_group_frontend" {
  name     = "${local.ecs_cluster_name}-frontend"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.main.id

  health_check {
    path = "/health"
  }

  # This target_type allows distributing traffic to
  # ECS services within EC2 instances (ECS cluster)
  # This needs to be "ip", not "instance", because:
  # https://docs.aws.amazon.com/AmazonECS/latest/developerguide/service-load-balancing.html
  # See section "Service Load Balancing Considerations"
  target_type = "ip"

  deregistration_delay = 15

  depends_on = [
    aws_alb.main
  ]
  tags = {
    Name = local.ecs_cluster_name
  }
}
resource "aws_alb_target_group" "target_group_backend" {
  name     = "${local.ecs_cluster_name}-backend"
  port     = 80
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

  depends_on = [
    aws_alb.main
  ]

  tags = {
    Name = local.ecs_cluster_name
  }
}

resource "aws_alb_listener" "http_traffic" {
  # Attach the listener to an actual ALB
  load_balancer_arn = aws_alb.main.id

  # Listens on port 80 ingress
  # Make sure the Security Group associated with the ALB allows this
  port     = "80"
  protocol = "HTTP"

  default_action {
    type = "redirect"

    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}

# Redirect requests that start with "/v1" to the REST API service
resource "aws_lb_listener_rule" "backend" {
  listener_arn = aws_alb_listener.https_traffic.arn
  priority     = 100

  action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.target_group_backend.arn
  }

  condition {
    field = "path-pattern"
    values = [
    "/v1/*"]
  }
}
