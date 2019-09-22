output "codebuild_tests" {
  value = aws_codebuild_project.codebuild_tests.name
}
output "codebuild_ecr_push" {
  value = aws_codebuild_project.codebuild_develop_push_to_ecr.name
}
output "codebuild_app_deploy" {
  value = aws_codebuild_project.codebuild_deploy_to_ecs.name
}
