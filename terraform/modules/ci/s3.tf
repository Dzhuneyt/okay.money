resource "aws_s3_bucket" "ci_bucket" {
  bucket        = "${var.app_name}-ci"
  acl           = "private"
  force_destroy = true
}

data "aws_s3_bucket" "terraform_backend" {
  bucket = "terraform-backends-dz"
}
