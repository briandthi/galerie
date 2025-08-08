#!/bin/bash

# Script de déploiement pour horny
set -e

echo "🚀 Début du déploiement..."

# Variables (à modifier selon ton environnement)
PROJECT_NAME="horny"
CONTAINER_NAME="horny-app"
PORT="3001"

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé"
    exit 1
fi

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose down || true

# Supprimer les images non utilisées (optionnel)
echo "🧹 Nettoyage des images non utilisées..."
docker image prune -f

# Build et démarrage
echo "🔨 Build et démarrage des conteneurs..."
docker-compose up --build -d

# Vérifier le status
echo "✅ Vérification du status..."
sleep 5
docker-compose ps

# Test de santé
echo "🏥 Test de santé..."
if curl -f http://localhost:$PORT > /dev/null 2>&1; then
    echo "✅ Déploiement réussi! Application disponible sur http://localhost:$PORT"
else
    echo "❌ Échec du test de santé"
    docker-compose logs
    exit 1
fi

echo "🎉 Déploiement terminé avec succès!"