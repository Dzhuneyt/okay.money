# Allow other resource to reference the Terraform backend
data "aws_dynamodb_table" "terraform_remote_state_lock" {
  name = "terraform-lock"
}
data "aws_s3_bucket" "terraform_backend" {
  bucket = "terraform-backends-dz"
}

data "aws_region" "current" {}
data "aws_billing_service_account" "main" {}
