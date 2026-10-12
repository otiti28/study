# Fiches : application de révision (V1)

Architecture : gateway Caddy (HTTPS) -> service auth + service study -> PostgreSQL.

## Lancer en local
    copy .env.example .env      (puis éditer DB_PASSWORD et JWT_SECRET)
    docker compose up -d --build
    -> http://localhost

## Déployer sur EC2 (Ubuntu 24.04)
1. Security group : ports 22 (votre IP), 80 et 443 (0.0.0.0/0).
2. Sur l'instance : sudo apt update && sudo apt install -y docker.io docker-compose-v2 git
3. Copier le projet (git clone ou scp), créer .env avec DOMAIN=votre-domaine.com
   (enregistrement DNS A vers l'Elastic IP), puis : sudo docker compose up -d --build
