// https://solidsoftware.io/blog/hybrid-spot-ondemand-ecs-cluster-setup/

provider "aws" {
  region = "us-east-1"
}
data "aws_region" "current" {

}

# Create a Security Group with SSH access from the world
resource "aws_security_group" "sg_for_ec2_instances" {
  name_prefix = "${local.ecs_cluster_name}_sg_for_ec2_instances_"
  description = "Security group that allows incoming HTTP and SSH traffic to EC2 instances within the cluster called ${local.ecs_cluster_name}"
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

  # Allow all HTTP traffic from the Load Balancer in the ephemeral (Docker) port range
  # This allows the ALB to call Docker Containers that run within the EC2 instances and have
  # exposed some ports in the ephemeral range of that EC2 instance
  ingress {
    from_port = 32768
    to_port = 61000
    protocol = "tcp"
    security_groups = [
      aws_security_group.sg_for_alb.id
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

  lifecycle {
    create_before_destroy = true
  }

  tags = {
    Name = local.ecs_cluster_name
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


# NEEDED FOR ALB
# ecs service role
resource "aws_iam_role" "ecs-service-role" {
  name = "ecs-service-role-test"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "ecs-service-attach" {
  role = aws_iam_role.ecs-service-role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
}
