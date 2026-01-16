# 🚀 Guide d'Hébergement pour AgriAssist

## 📋 Table des Matières
1. [Options d'Hébergement](#options-dhébergement)
2. [Prérequis](#prérequis)
3. [Hébergement Vercel (Recommandé)](#hébergement-vercel-recommandé)
4. [Hébergement Netlify](#hébergement-netlify)
5. [Hébergement VPS/Dédié](#hébergement-vpsdédié)
6. [Hébergement Cloud (AWS/Azure/GCP)](#hébergement-cloud-awsazuregcp)
7. [Configuration de la Base de Données](#configuration-de-la-base-de-données)
8. [Variables d'Environnement](#variables-denvironnement)
9. [Déploiement Automatisé](#déploiement-automatisé)
10. [Surveillance et Maintenance](#surveillance-et-maintenance)

---

## 🌐 Options d'Hébergement

### 🥇 Vercel (Recommandé pour commencer)
- **Coût** : Gratuit pour commencer, puis $20/mois Pro
- **Avantages** : Intégré Next.js, CDN mondial, HTTPS automatique
- **Idéal pour** : Applications Next.js, MVP, projets personnels

### 🥈 Netlify
- **Coût** : Gratuit pour commencer, puis $19/mois Pro
- **Avantages** : Build automatique, Forms, Functions
- **Idéal pour** : Sites statiques avec fonctions serverless

### 🥉 VPS/Dédié
- **Coût** : $5-50/mois selon les ressources
- **Avantages** : Contrôle total, performances personnalisables
- **Idéal pour** : Applications avec besoins spécifiques

### 🔥 Cloud (AWS/Azure/GCP)
- **Coût** : Pay-as-you-go
- **Avantages** : Scalabilité infinie, services managés
- **Idéal pour** : Applications enterprise, haute disponibilité

---

## 📦 Prérequis

### Pour tous les hébergements :
```bash
# Vérifier la version Node.js
node --version  # >= 18.0.0

# Vérifier npm
npm --version  # >= 8.0.0

# Tester localement
npm run build
npm start
```

### Fichiers nécessaires :
- ✅ `package.json`
- ✅ `next.config.js`
- ✅ `tailwind.config.js`
- ✅ Dossier `src/` complet
- ✅ Scripts de déploiement (`deploy.sh`, `deploy.bat`)

---

## ⚡ Hébergement Vercel (Recommandé)

### Étape 1: Créer un compte Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Créez un compte avec GitHub/GitLab/Bitbucket
3. Connectez votre dépôt Git

### Étape 2: Configuration du projet
```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer localement (test)
vercel

# Déployer en production
vercel --prod
```

### Étape 3: Configuration Vercel
Créez `vercel.json` :
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "DATABASE_URL": "@database_url",
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*.js": {
      "maxDuration": 30
    }
  }
}
```

### Étape 4: Variables d'environnement
Dans le dashboard Vercel :
```
DATABASE_URL=mysql://user:password@host:port/database
NEXTAUTH_URL=https://yourapp.vercel.app
NEXTAUTH_SECRET=your-secret-key
```

---

## 🌿 Hébergement Netlify

### Étape 1: Préparation
```bash
# Créer netlify.toml
[build]
  publish = ".next"
  command = "npm run build"

[functions]
  directory = "api"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Étape 2: Déploiement
```bash
# Installer Netlify CLI
npm i -g netlify-cli

# Déployer
netlify deploy --prod
```

---

## 🖥️ Hébergement VPS/Dédié

### Étape 1: Configuration du serveur
```bash
# Mise à jour du serveur
sudo apt update && sudo apt upgrade -y

# Installer Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 (process manager)
sudo npm install -g pm2

# Installer Nginx (reverse proxy)
sudo apt install nginx -y
```

### Étape 2: Configuration Nginx
Créez `/etc/nginx/sites-available/agriassist` :
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Étape 3: Déploiement avec PM2
```bash
# Cloner le projet
git clone https://github.com/yourusername/agriassist.git
cd agriassist

# Installer les dépendances
npm install

# Construire le projet
npm run build

# Démarrer avec PM2
pm2 start npm --name "agriassist" -- start

# Sauvegarder la configuration PM2
pm2 save
pm2 startup
```

### Étape 4: SSL avec Let's Encrypt
```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d yourdomain.com

# Renouvellement automatique
sudo crontab -e
# Ajouter: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## ☁️ Hébergement Cloud (AWS)

### Option 1: AWS Amplify
```bash
# Installer Amplify CLI
npm install -g @aws-amplify/cli

# Initialiser
amplify init

# Ajouter l'hébergement
amplify add hosting

# Déployer
amplify publish
```

### Option 2: AWS EC2 + Elastic Beanstalk
```bash
# Installer EB CLI
pip install awsebcli

# Initialiser l'application
eb init agriassist

# Créer l'environnement
eb create production

# Déployer
eb deploy
```

---

## 🗄️ Configuration de la Base de Données

### Option 1: PlanetScale (Recommandé)
```bash
# Créer un compte PlanetScale
# Créer une base de données
# Obtenir la chaîne de connexion
DATABASE_URL=mysql://user:password@host:port/database
```

### Option 2: Supabase
```bash
# Créer un compte Supabase
# Créer un projet
# Utiliser l'URL fournie
DATABASE_URL=postgresql://user:password@host:port/database
```

### Option 3: MySQL sur VPS
```bash
# Installer MySQL
sudo apt install mysql-server -y

# Sécuriser l'installation
sudo mysql_secure_installation

# Créer la base de données
mysql -u root -p
CREATE DATABASE agriplatform;
CREATE USER 'agriuser'@'localhost' IDENTIFIED BY 'strongpassword';
GRANT ALL PRIVILEGES ON agriplatform.* TO 'agriuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔧 Variables d'Environnement

### Créez `.env.production` :
```env
# Base de données
DATABASE_URL=mysql://user:password@host:port/database

# NextAuth
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-key

# Application
NODE_ENV=production
PORT=3000

# Logs (optionnel)
LOG_LEVEL=info
LOG_FILE=/var/log/agriassist.log

# Backup (optionnel)
BACKUP_DIR=/var/backups/agriassist
```

---

## 🤖 Déploiement Automatisé

### GitHub Actions
Créez `.github/workflows/deploy.yml` :
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

## 📊 Surveillance et Maintenance

### Monitoring avec le système intégré
```bash
# Accéder au dashboard de santé
https://yourdomain.com/dashboard/system/health

# API de monitoring
https://yourdomain.com/api/health
```

### Logs et Alertes
```bash
# Vérifier les logs PM2
pm2 logs agriassist

# Vérifier les logs système
sudo tail -f /var/log/nginx/error.log

# Monitoring automatique
curl https://yourdomain.com/api/health
```

### Backups Automatiques
```bash
# Script de backup (déjà inclus)
./deploy.sh backup

# Backup manuel
curl -X POST https://yourdomain.com/api/backup \
  -H "Content-Type: application/json" \
  -d '{"type": "full"}'
```

---

## 💰 Coûts Estimés

### Vercel (Recommandé)
- **Gratuit** : 100GB bande passante/mois
- **Pro** : $20/mois (bande passante illimitée)
- **Enterprise** : Sur devis

### VPS (DigitalOcean/Vultr)
- **Basic** : $5/mois (1 vCPU, 1GB RAM, 25GB SSD)
- **Standard** : $10/mois (1 vCPU, 2GB RAM, 50GB SSD)
- **Premium** : $20/mois (2 vCPU, 4GB RAM, 80GB SSD)

### Base de données
- **PlanetScale** : Gratuit jusqu'à 5GB
- **Supabase** : Gratuit jusqu'à 500MB
- **MySQL VPS** : $5/mois supplémentaires

---

## 🎯 Recommandation Finale

### Pour commencer :
1. **Vercel Gratuit** - Idéal pour tester et MVP
2. **PlanetScale Gratuit** - Base de données managée
3. **Domaine personnalisé** - $10-15/an

### Pour production :
1. **Vercel Pro** - $20/mois
2. **PlanetScale Scale** - $39/mois
3. **Domaine professionnel** - $10-15/an

**Total estimé : $70-75/mois pour une application robuste**

---

## 🚀 Déploiement Rapide

### Commande unique pour Vercel :
```bash
# Clone et déploiement instantané
git clone https://github.com/yourusername/agriassist.git
cd agriassist
npm install
vercel --prod
```

### Pour VPS :
```bash
# Script de déploiement complet
./deploy.sh deploy
```

---

## 📞 Support et Aide

- **Documentation Vercel** : [vercel.com/docs](https://vercel.com/docs)
- **Community Discord** : [discord.gg/vercel](https://discord.gg/vercel)
- **Support technique** : Disponible 24/7 pour plans payants
- **Monitoring intégré** : Dashboard santé toujours accessible

---

*Ce guide couvre toutes les options d'hébergement pour AgriAssist. Choisissez celle qui correspond le mieux à vos besoins et à votre budget.*
