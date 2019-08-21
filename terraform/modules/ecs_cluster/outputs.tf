output "cluster_id" {
  value = aws_ecs_cluster.ecs_cluster.id
}
output "sg_for_ec2_instances" {
  value = aws_security_group.sg_for_ec2_instances.id
}
