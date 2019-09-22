////# Create HTTPS certificate
//resource "aws_acm_certificate" "cert" {
//  domain_name = var.domain_name
//  validation_method = "DNS"
//  tags = {
//    Name = var.app_name
//  }
//}
//resource "aws_route53_record" "cert_validation_dns_record_1" {
//  name = aws_acm_certificate.cert.domain_validation_options[0].resource_record_name
//  type = aws_acm_certificate.cert.domain_validation_options[0].resource_record_type
//  zone_id = aws_route53_zone.domain.id
//  records = [
//    aws_acm_certificate.cert.domain_validation_options[0].resource_record_value]
//  ttl = 60
//}
//resource "aws_acm_certificate_validation" "cert" {
//  certificate_arn = aws_acm_certificate.cert.arn
//  validation_record_fqdns = [
//    aws_route53_record.cert_validation_dns_record_1.fqdn
//  ]
//
//}
//# Listener for traffic
//resource "aws_alb_listener" "https_traffic" {
//  # Attach the listener to an actual ALB
//  load_balancer_arn = aws_alb.main.id
//  certificate_arn = aws_acm_certificate_validation.cert.certificate_arn
//
//  port = "443"
//  protocol = "HTTPS"
//  ssl_policy = "ELBSecurityPolicy-2016-08"
//
//  # And forwards everything to a "catch all" ALB group (frontend)
//  default_action {
//    type = "forward"
//    target_group_arn = aws_alb_target_group.target_group_frontend.id
//  }
//}
