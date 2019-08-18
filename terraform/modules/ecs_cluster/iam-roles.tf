# Create an IAM role for the ECS EC2 instances.
resource "aws_iam_role" "ecs_instance" {
  name = "${var.cluster_name}-ec2-instance-role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": [
          "ec2.amazonaws.com",
          "ecs-tasks.amazonaws.com"
        ]
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# Create and attach an IAM role policy which allows
# the necessary permissions for the ECS agent to function
data "aws_iam_policy_document" "ecs_instance_role_policy_doc" {
  statement {
    actions = [
      "ecs:CreateCluster",
      "ecs:DeregisterContainerInstance",
      "ecs:DiscoverPollEndpoint",
      "ecs:Poll",
      "ecs:RegisterContainerInstance",
      "ecs:StartTelemetrySession",
      "ecs:Submit*",
      "ecs:StartTask",
      "ecr:GetAuthorizationToken",
      "ecr:BatchCheckLayerAvailability",
      "ecr:GetDownloadUrlForLayer",
      "ecr:BatchGetImage",
      "logs:CreateLogStream",
      "logs:PutLogEvents"
    ]
    resources = [
      "*",
    ]
  }
}

# Create the custom policy
resource "aws_iam_policy" "ecs_role_permissions" {
  name        = "${var.cluster_name}-ecs_role_permissions"
  description = "These policies allow the ECS instances to do certain actions like pull images from ECR"
  path        = "/"
  policy      = data.aws_iam_policy_document.ecs_instance_role_policy_doc.json
}

# Attach the custom Policy to the Role
resource "aws_iam_policy_attachment" "ecs_instance_role_policy_attachment" {
  name = "ecs_instance_role_policy_attachment"
  roles = [
  aws_iam_role.ecs_instance.name]
  policy_arn = aws_iam_policy.ecs_role_permissions.arn
}

# Allow EC2 instances to be launched using this role
resource "aws_iam_instance_profile" "ec2_iam_instance_profile" {
  name_prefix = var.cluster_name
  role        = aws_iam_role.ecs_instance.name
}
