//# Remote backend
terraform {
  backend "s3" {
    bucket = "terraform-backends-dz"

    # There is one state file per environment (e.g. git branch)
    # Make sure to initialize this folder, using the partial config approach
    # The easiest way is to use the ./terraform-init.sh script
    # Take a look at the source code for more information
    // key = "personal-finance.tfstate"

    region         = "eu-west-1"
    dynamodb_table = "terraform-lock"
  }
}
