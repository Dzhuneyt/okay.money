data "template_file" "task_definition_nginx" {
  template = file("${path.module}/app-task-definition.json")

  vars = {
    image_url = "nginx:latest"
    container_name = "${local.ecs_cluster_name}_nginx"
    log_group_region = data.aws_region.current.name
    log_group_name = aws_cloudwatch_log_group.app.name
  }
}

resource "aws_ecs_task_definition" "ghost" {
  family = "tf_example_ghost_td"
  container_definitions = data.template_file.task_definition_nginx.rendered
}

resource "aws_ecs_service" "nginx" {
  name = "${local.ecs_cluster_name}_nginx"
  cluster = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ghost.arn
  desired_count = "1"
  iam_role = aws_iam_role.ecs-service-role.arn

  load_balancer {
    # Register the ECS service within the ALB target group
    # This makes the service participate in health checks
    # and receive traffic when healthy
    target_group_arn = aws_alb_target_group.test.id
    container_name = "${local.ecs_cluster_name}_nginx"
    container_port = "80"
  }

  depends_on = [
    aws_iam_role_policy.instance,
    aws_alb_listener.front_end,
  ]
}

data "template_file" "instance_profile" {
  template = file("${path.module}/instance-profile-policy.json")

  vars = {
    app_log_group_arn = aws_cloudwatch_log_group.app.arn
    ecs_log_group_arn = aws_cloudwatch_log_group.ecs.arn
  }
}

resource "aws_iam_role_policy" "instance" {
  name = "TfEcsExampleInstanceRole"
  role = aws_iam_role.ecs_instance.name
  policy = data.template_file.instance_profile.rendered
}

# ALB

# see https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html
resource "aws_alb_target_group" "test" {
  name = "tf-example-ecs-ghost"
  port = 80
  protocol = "HTTP"
  vpc_id = aws_vpc.main.id
}

resource "aws_alb" "main" {
  name = "tf-example-alb-ecs"
  subnets = aws_subnet.public_subnets.*.id
  security_groups = [
    aws_security_group.ecs_cluster.id]

  depends_on = [
    aws_subnet.public_subnets
  ]
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

## CloudWatch Logs

resource "aws_cloudwatch_log_group" "ecs" {
  name = "tf-ecs-group/ecs-agent"
}

resource "aws_cloudwatch_log_group" "app" {
  name = "tf-ecs-group/app-ghost"
}
