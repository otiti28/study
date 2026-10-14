#!/bin/bash
set -e
docker build -t otniiel/study:latest .
docker push otniiel/study:latest
ssh -i ~/.ssh/deploy_study ubuntu@16.171.145.118 \
  "docker pull otniiel/study:latest && docker rm -f study; docker run -d --name study --restart unless-stopped -p 80:80 otniiel/study:latest"
