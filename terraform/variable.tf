variable "version_tag" {
  description = "The version of the Docker Images to pull from ECR"
}

variable "create_iam_service_linked_role" {
  default     = "false"
  description = "Whether or not to create a service-linked role for ECS inside your AWS account. Such role is automatically created the first time you provision an ECS cluster using the AWS UI, CLI, Terraform, etc. If you previously created an ECS cluster, set this to false, else set it to true"
}
variable "domain_name" {
  description = "The domain name to use for the whole stack. This will be used to create a Route 53 record and many other resources depend on it"
}
