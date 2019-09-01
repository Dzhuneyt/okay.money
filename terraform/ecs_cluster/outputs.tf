output "cluster_id" {
  value = module.ecs_cluster.cluster_id
}
output "service_discovery_id" {
  value = module.ecs_cluster.service_discovery_id
}
output "security_group_for_ec2_instances" {
  value = module.ecs_cluster.security_group_for_ec2_instances
}
