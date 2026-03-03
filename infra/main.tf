provider "aws" {
  region = var.region
}

variable "region" {
  default = "ap-south-1"
}

variable "availability_zone" {
  default = "ap-south-1a"
}

variable "key_name" {
  description = "Existing AWS Key Pair name"
  type        = string
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnet" "default" {
  default_for_az   = true
  availability_zone = var.availability_zone
}

resource "aws_security_group" "k8s_sg" {
  name        = "k8s-security-group"
  description = "Allow SSH & Kubernetes traffic"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Kubernetes API Server"
    from_port   = 6443
    to_port     = 6443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "NodePort Range"
    from_port   = 30000
    to_port     = 32767
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Internal Cluster Communication"
    from_port   = 0
    to_port     = 65535
    protocol    = "tcp"
    self        = true
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}

resource "aws_instance" "master" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "m7i.small"
  subnet_id                   = data.aws_subnet.default.id
  vpc_security_group_ids      = [aws_security_group.k8s_sg.id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  tags = {
    Name = "k8s-master"
  }
}

resource "aws_eip" "master_eip" {
  instance = aws_instance.master.id
  domain   = "vpc"
}

resource "aws_instance" "worker" {
  ami                         = data.aws_ami.amazon_linux.id
  instance_type               = "m7i.small"
  subnet_id                   = data.aws_subnet.default.id
  vpc_security_group_ids      = [aws_security_group.k8s_sg.id]
  key_name                    = var.key_name
  associate_public_ip_address = true

  tags = {
    Name = "k8s-worker"
  }
}

resource "aws_eip" "worker_eip" {
  instance = aws_instance.worker.id
  domain   = "vpc"
}

output "master_public_ip" {
  value = aws_eip.master_eip.public_ip
}

output "worker_public_ip" {
  value = aws_eip.worker_eip.public_ip
}
