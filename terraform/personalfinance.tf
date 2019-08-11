data "template_file" "instance_profile" {
  template = file("${path.module}/instance-profile-policy.json")

  vars = {
    app_log_group_arn = aws_cloudwatch_log_group.app.arn
    ecs_log_group_arn = aws_cloudwatch_log_group.ecs.arn
  }
}

resource "aws_iam_role_policy" "instance" {
  name   = "TfEcsExampleInstanceRole"
  role   = aws_iam_role.ecs_instance.name
  policy = data.template_file.instance_profile.rendered
}
