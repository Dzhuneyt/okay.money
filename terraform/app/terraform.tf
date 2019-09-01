//# Remote backend
terraform {
  backend "s3" {
    bucket = "terraform-backends-dz"
    # Do not hardcode the key. Instead, pass it as an argument to "terraform init" like so:
    # "terraform init -backend-config="key=personal-finance/app-${branch}.tfstate"
    //    key            = "personal-finance/app.tfstate"
    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}
