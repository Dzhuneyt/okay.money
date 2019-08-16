resource "aws_vpc_peering_connection" "foo" {
  peer_owner_id = var.vpc_perring_owner_id
  peer_vpc_id = var.vpc_peering_vpc_id
  vpc_id = aws_vpc.main.id

  auto_accept = true

  accepter {
    allow_remote_vpc_dns_resolution = true
  }

  requester {
    allow_remote_vpc_dns_resolution = true
  }
}
