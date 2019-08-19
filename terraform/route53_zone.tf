resource "aws_route53_zone" "domain" {
  name = var.domain_name
  delegation_set_id = var.route53_delegation_set_id
  tags = {
    Name = local.ecs_cluster_name
  }
}

# Forward traffic to ALB from Route53 zone
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.domain.zone_id
  name = var.domain_name
  type = "A"

  alias {
    name = aws_alb.main.dns_name
    zone_id = aws_alb.main.zone_id
    evaluate_target_health = true
  }
}

//# Overwrite nameservers
//resource "aws_route53_record" "primary-ns" {
//  allow_overwrite = true
//  zone_id = aws_route53_zone.domain.zone_id
//  name = var.domain_name
//  type = "NS"
//  ttl = "60"
//  records = [
//    "ns-1179.awsdns-19.org.",
//    "ns-153.awsdns-19.com.",
//    "ns-1993.awsdns-57.co.uk.",
//    "ns-706.awsdns-24.net."]
//}
//resource "aws_route53_record" "primary-soa" {
//  allow_overwrite = true
//  zone_id = aws_route53_zone.domain.zone_id
//  name = var.domain_name
//  type = "SOA"
//  ttl = "300"
//  records = [
//    "ns-1179.awsdns-19.org. awsdns-hostmaster.amazon.com. 1 7200 900 1209600 86400"]
//}
