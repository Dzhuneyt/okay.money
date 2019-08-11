# Lookup the current ECS AMI.
# In a production environment you probably want to
# hardcode the AMI ID, to prevent upgrading to a
# new and potentially broken release.
data "aws_ami" "ecs" {
  most_recent = true

  filter {
    name = "name"
    values = [
    "amzn2-ami-ecs-*"]
  }

  filter {
    name = "virtualization-type"
    values = [
    "hvm"]
  }

  owners = [
  "591542846629"]
  # Amazon

  //  most_recent = true
  //  owners = ["099720109477"] # Canonical
  //
  //  filter {
  //    name   = "name"
  //    values = ["ubuntu/images/hvm-ssd/ubuntu-xenial-16.04-amd64-server-*"]
  //  }
  //
  //  filter {
  //    name = "virtualization-type"
  //    values = [
  //      "hvm"]
  //  }
}
