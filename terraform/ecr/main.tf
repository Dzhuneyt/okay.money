provider "aws" {
  region = "eu-west-1"
}

resource "aws_ecr_repository" "backend" {
  name = "finance/backend"
}
resource "aws_ecr_repository" "frontend" {
  name = "finance/frontend"
}
resource "aws_ecr_repository" "nginx" {
  name = "finance/nginx"
}
