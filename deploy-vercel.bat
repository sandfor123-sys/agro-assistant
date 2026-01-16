@echo off
REM 🚀 Script de Déploiement Rapide pour Vercel (Windows)
REM Usage: deploy-vercel.bat

echo 🚀 Déploiement d'AgriAssist sur Vercel...

REM Vérifier les prérequis
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ npm n'est pas installé. Veuillez l'installer d'abord.
    pause
    exit /b 1
)

REM Installer Vercel CLI si nécessaire
where vercel >nul 2>nul
if %errorlevel% neq 0 (
    echo 📦 Installation de Vercel CLI...
    npm install -g vercel
)

REM Nettoyer et installer les dépendances
echo 🧹 Nettoyage et installation des dépendances...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
npm install

REM Construire le projet
echo 🔨 Construction du projet...
npm run build

REM Se connecter à Vercel
echo 🔐 Connexion à Vercel...
vercel login

REM Déployer en production
echo 🚀 Déploiement en production...
vercel --prod

echo ✅ Déploiement terminé !
echo 🌐 Votre application est maintenant en ligne sur Vercel !
pause
