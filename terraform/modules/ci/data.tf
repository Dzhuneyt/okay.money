# Allow other resource to reference the Terraform backend
data "aws_dynamodb_table" "terraform_remote_state_lock" {
  name = "terraform-lock"
}
