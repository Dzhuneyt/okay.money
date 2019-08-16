resource "aws_route53_zone" "domain" {
  name = var.domain_name
  tags = {
    Name = local.ecs_cluster_name
  }
}

# Create HTTPS certificate
resource "aws_acm_certificate" "cert" {
  domain_name = var.domain_name
  validation_method = "DNS"
  tags = {
    Name = local.ecs_cluster_name
  }
}
resource "aws_route53_record" "cert_validation" {
  name = aws_acm_certificate.cert.domain_validation_options[0].resource_record_name
  type = aws_acm_certificate.cert.domain_validation_options[0].resource_record_type
  zone_id = aws_route53_zone.domain.id
  records = [
    aws_acm_certificate.cert.domain_validation_options[0].resource_record_value]
  ttl = 60
}
resource "aws_acm_certificate_validation" "cert" {
  certificate_arn = aws_acm_certificate.cert.arn
  validation_record_fqdns = [
    aws_route53_record.cert_validation.fqdn]
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
