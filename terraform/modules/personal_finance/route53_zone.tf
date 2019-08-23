resource "aws_route53_zone" "domain" {
  name              = var.domain_name
  delegation_set_id = var.route53_delegation_set_id
  tags = {
    Name = var.app_name
  }
}

# Forward traffic to ALB from Route53 zone
resource "aws_route53_record" "www" {
  zone_id = aws_route53_zone.domain.zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_alb.main.dns_name
    zone_id                = aws_alb.main.zone_id
    evaluate_target_health = true
  }
}
