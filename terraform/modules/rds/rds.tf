# Whitelist the NAT gateway of the stack inside the Security Group of the existing RDS,
# which is btw, in a different region
resource "aws_security_group_rule" "allow_nat_gateway_to_rds" {
  from_port         = 3306
  to_port           = 3306
  protocol          = "TCP"
  security_group_id = data.aws_security_group.existing_rds_security_group.id
  type              = "ingress"
  cidr_blocks       = var.allowed_ingress_ips
  description       = "Allow traffic from ECS cluster ${var.cluster_name}"
}
