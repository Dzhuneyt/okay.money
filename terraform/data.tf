# Get AZs for the current AWS region
data "aws_availability_zones" "available" {
  state = "available"
}
data "aws_region" "current" {

}
data "aws_ecs_cluster" "ecs_cluster" {
  # Cluster created in another stack
  cluster_name = "Apps"
}
