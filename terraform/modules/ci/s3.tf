resource "aws_s3_bucket" "ci_bucket" {
  bucket        = "${var.app_name}-ci"
  acl           = "private"
  force_destroy = true
  lifecycle_rule {
    id      = "cleanup"
    enabled = true

    expiration {
      days = 7
    }
  }
}

data "aws_s3_bucket" "terraform_backend" {
  bucket = "terraform-backends-dz"
}
