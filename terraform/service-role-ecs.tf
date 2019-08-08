# Allow AWS ECS to manage the clusters on my behalf
//resource "aws_iam_service_linked_role" "ecs" {
//  custom_suffix = local.ecs_cluster_name
//  aws_service_name = "ecs.amazonaws.com"
//}
