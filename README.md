# 🚀 AgriAssist Platform

Plateforme agricole intelligente avec monitoring, calcul d'intrants, et gestion des parcelles.

## 🌟 Fonctionnalités

- 🌱 **Gestion des parcelles** : Suivi des cultures et planning
- 📊 **Calculateur d'intrants** : Optimisation des ressources
- 🚨 **Alertes intelligentes** : Notifications météo et incidents
- 📈 **Monitoring système** : Santé de l'application en temps réel
- 💾 **Sauvegardes automatiques** : Protection des données
- 🤖 **Assistant IA** : Aide agricole personnalisée

## 🚀 Déploiement Rapide

### Vercel (Recommandé)
1. Connectez votre repository GitHub à Vercel
2. Importez le projet
3. Déployez automatiquement

### VPS
```bash
npm install
npm run build
pm2 start npm --name "agriassist" -- start
```

## 📁 Structure du Projet

```
src/
├── app/                 # Pages Next.js 13+ App Router
│   ├── api/            # Routes API
│   ├── dashboard/       # Tableau de bord
│   └── globals.css     # Styles globaux
├── components/         # Composants React
├── lib/              # Utilitaires et configuration
└── public/           # Fichiers statiques
```

## 🔧 Configuration

### Variables d'environnement
```env
DATABASE_URL=mysql://user:password@host:port/database
NODE_ENV=production
```

## 📊 Monitoring Intégré

- **Health API** : `/api/health`
- **Dashboard système** : `/dashboard/system/health`
- **Logs structurés** : Rotation automatique
- **Backups** : Automatisés avec nettoyage

## 🎯 Stack Technique

- **Frontend** : Next.js 16, React 18, TailwindCSS
- **Backend** : Node.js, API routes Next.js
- **Database** : MySQL avec pool de connexions
- **Deployment** : Vercel, Netlify, VPS compatible

## 🛠️ Installation Locale

```bash
npm install
npm run dev
# http://localhost:3000
```

## 📱 Responsive Design

- ✅ Desktop : Interface complète
- ✅ Mobile : Optimisé tactile
- ✅ Tablet : Adapté 10 pouces+

---

**Développé avec ❤️ pour les agriculteurs modernes**
