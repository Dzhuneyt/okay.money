// https://solidsoftware.io/blog/hybrid-spot-ondemand-ecs-cluster-setup/

provider "aws" {
  region = "us-east-1"
}

# Define some variables we'll use later.
locals {
  instance_type = "t3a.micro"
  spot_price = "0.10"
  key_name = "Scava Ubuntu PC id_rsa"
  ecs_cluster_name = "Personal_Finance"
  max_spot_instances = 3
  min_spot_instances = 0

  max_ondemand_instances = 3
  min_ondemand_instances = 1

  # TODO Define also the AZs here (hardcoded) because sometimes Terraform creates 2 subnets in the same AZ and a Load balancer can not be attached to such thing
  public_subnets = [
    "10.0.1.0/24",
    "10.0.2.0/24",
    "10.0.3.0/24"]
}

# Create a Security Group with SSH access from the world
resource "aws_security_group" "ecs_cluster" {
  name = "${local.ecs_cluster_name}_ecs_cluster"
  description = "An ecs cluster"
  vpc_id = data.aws_vpc.default.id

  # Allow SSH
  ingress {
    from_port = 22
    to_port = 22
    protocol = "tcp"
    cidr_blocks = [
      "0.0.0.0/0"
    ]
  }

  # Allow HTTP
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
}

# Create an IAM role for the ECS instances.
resource "aws_iam_role" "ecs_instance" {
  name = "ecs_instance"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ec2.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

# Create and attach an IAM role policy which alllows the necessary
# permissions for the ECS agent to function. 
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

resource "aws_iam_policy" "ecs_role_permissions" {
  name = "ecs_role_permissions"
  description = "ECS instance permissions"
  path = "/"
  policy = data.aws_iam_policy_document.ecs_instance_role_policy_doc.json
}


resource "aws_iam_policy_attachment" "ecs_instance_role_policy_attachment" {
  name = "ecs_instance_role_policy_attachment"
  roles = [
    aws_iam_role.ecs_instance.name]
  policy_arn = aws_iam_policy.ecs_role_permissions.arn
}

resource "aws_iam_instance_profile" "ecs_iam_profile" {
  name = "ecs_role_instance_profile"
  role = aws_iam_role.ecs_instance.name
}


resource "aws_ecs_cluster" "ecs_cluster" {
  name = local.ecs_cluster_name
}
