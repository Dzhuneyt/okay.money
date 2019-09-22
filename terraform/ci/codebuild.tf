module "codebuild_develop" {
  source = "./codebuild"

  branch_name = "develop"
  //  s3_ci_bucket_arn = aws_s3_bucket.ci_bucket.arn
  tag = var.tag
  providers = {
    aws = aws
  }
  private_subnets = var.private_subnets
  vpc_id          = var.vpc_id
  s3_ci_bucket    = aws_s3_bucket.ci_bucket.bucket
}
module "codebuild_master" {
  source = "./codebuild"

  branch_name = "master"
  //  s3_ci_bucket_arn = aws_s3_bucket.ci_bucket.arn
  tag = var.tag
  providers = {
    aws = aws
  }
  private_subnets = var.private_subnets
  vpc_id          = var.vpc_id
  s3_ci_bucket    = aws_s3_bucket.ci_bucket.bucket
}
