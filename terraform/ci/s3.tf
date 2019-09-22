resource "aws_s3_bucket" "ci_bucket" {
  bucket        = "${lower(var.tag)}-ci"
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


