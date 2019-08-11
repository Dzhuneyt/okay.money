// https://solidsoftware.io/blog/hybrid-spot-ondemand-ecs-cluster-setup/

provider "aws" {
  region = "us-east-1"
}
data "aws_region" "current" {

}

# NEEDED FOR ALB TODO: is it needed anymore?
# ecs service role
//resource "aws_iam_role" "ecs-service-role" {
//  name = "ecs-service-role-test"
//
//  assume_role_policy = <<EOF
//{
//  "Version": "2012-10-17",
//  "Statement": [
//    {
//      "Action": "sts:AssumeRole",
//      "Principal": {
//        "Service": "ecs.amazonaws.com"
//      },
//      "Effect": "Allow",
//      "Sid": ""
//    }
//  ]
//}
//EOF
//}
//
//resource "aws_iam_role_policy_attachment" "ecs-service-attach" {
//  role = aws_iam_role.ecs-service-role.name
//  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceRole"
//}
