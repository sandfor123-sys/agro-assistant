#!/bin/bash

# 🚀 Script de Déploiement Rapide pour Vercel
# Usage: ./deploy-vercel.sh

echo "🚀 Déploiement d'AgriAssist sur Vercel..."

# Vérifier les prérequis
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Installer Vercel CLI si nécessaire
if ! command -v vercel &> /dev/null; then
    echo "📦 Installation de Vercel CLI..."
    npm install -g vercel
fi

# Nettoyer et installer les dépendances
echo "🧹 Nettoyage et installation des dépendances..."
rm -rf node_modules package-lock.json
npm install

# Construire le projet
echo "🔨 Construction du projet..."
npm run build

# Se connecter à Vercel
echo "🔐 Connexion à Vercel..."
vercel login

# Déployer en production
echo "🚀 Déploiement en production..."
vercel --prod

echo "✅ Déploiement terminé !"
echo "🌐 Votre application est maintenant en ligne sur Vercel !"
