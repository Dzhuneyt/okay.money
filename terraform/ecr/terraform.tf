//# Remote backend
terraform {
  backend "s3" {
    bucket         = "terraform-backends-dz"
    key            = "personal-finance/ecr.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}
