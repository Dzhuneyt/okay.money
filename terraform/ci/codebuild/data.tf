# Allow other resource to reference the Terraform backend
data "aws_dynamodb_table" "terraform_remote_state_lock" {
  name = "terraform-lock"
}
data "aws_s3_bucket" "terraform_backend" {
  bucket = "terraform-backends-dz"
}

data "aws_region" "current" {}
data "aws_billing_service_account" "main" {}

data "aws_codecommit_repository" "test" {
  repository_name = "Personal-Finance"
}
data "aws_s3_bucket" "ci_bucket" {
  bucket = var.s3_ci_bucket
}
