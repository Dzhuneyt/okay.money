data "aws_region" "current" {

}
data "template_file" "task_definition" {
  template = file("${path.module}/app-task-definition.json")

  vars = {
    image_url = "ghost:latest"
    container_name = "ghost"
    log_group_region = data.aws_region.current.name
    log_group_name = aws_cloudwatch_log_group.app.name
  }
}

resource "aws_ecs_task_definition" "ghost" {
  family = "tf_example_ghost_td"
  container_definitions = data.template_file.task_definition.rendered
}

resource "aws_ecs_service" "test" {
  name = "tf-example-ecs-ghost"
  cluster = aws_ecs_cluster.ecs_cluster.id
  task_definition = aws_ecs_task_definition.ghost.arn
  desired_count = "1"
  iam_role = aws_iam_role.ecs_instance.name

  load_balancer {
    target_group_arn = aws_alb_target_group.test.id
    container_name = "ghost"
    container_port = "2368"
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

resource "aws_alb_target_group" "test" {
  name = "tf-example-ecs-ghost"
  port = 8080
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

resource "aws_alb_listener" "front_end" {
  load_balancer_arn = aws_alb.main.id
  port = "80"
  protocol = "HTTP"

  default_action {
    target_group_arn = aws_alb_target_group.test.id
    type = "forward"
  }
}

## CloudWatch Logs

resource "aws_cloudwatch_log_group" "ecs" {
  name = "tf-ecs-group/ecs-agent"
}

resource "aws_cloudwatch_log_group" "app" {
  name = "tf-ecs-group/app-ghost"
}
