# 🌱 AgriAssist CI

**Plateforme de gestion agricole intelligente pour la Côte d'Ivoire**

[![Version](https://img.shields.io/badge/version-1.0.0-green.svg)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## 📋 Description

AgriAssist CI est une application web moderne conçue pour aider les agriculteurs ivoiriens à gérer efficacement leurs cultures. L'application offre des outils de calcul, de suivi et d'apprentissage adaptés aux réalités agricoles de la Côte d'Ivoire.

## ✨ Fonctionnalités

### 🏠 Dashboard
- Météo en temps réel
- Statistiques des parcelles
- Actions rapides
- Suivi de progression

### 🌾 Gestion des Parcelles
- Ajout et gestion de parcelles
- Suivi de croissance par phase
- Calcul automatique de progression
- Estimation de dates de récolte

### 🧮 Calculateur Intelligent
- Calcul des besoins en intrants
- Estimation du nombre de plants
- Recommandations par culture
- Groupement par type (Semences, Engrais, Traitements)

### 📚 Guides Pratiques
- 10+ tutoriels détaillés
- Recherche en temps réel
- Filtres par catégorie
- Instructions étape par étape

### 🔔 Notifications
- Alertes de stock faible
- Rappels de tâches à venir
- Badge de notification
- Système de toast

### 👤 Profil Utilisateur
- Statistiques personnelles
- Paramètres (à venir)
- Gestion de compte

## 🚀 Installation

### Prérequis
- WAMP Server (Windows)
- PHP 5.5+
- MySQL 5.6+
- Navigateur moderne

### Étapes

1. **Cloner le projet**
```bash
cd c:\wamp\www\
git clone [url] agriculture_platform
```

2. **Démarrer WAMP**
- Lancer WAMP
- Vérifier que l'icône est verte

3. **Installer la base de données**
- Accéder à `http://localhost/agriculture_platform/database/install.php`
- Cliquer sur "Installer la base de données"
- Attendre la fin de l'installation

4. **Accéder à l'application**
- Dashboard: `http://localhost/agriculture_platform/index.php`

## 🎨 Design

### Système de Design Moderne
- **Typographie**: Plus Jakarta Sans
- **Couleurs**: 
  - Primaire: `#16a34a` (Vert)
  - Accent: `#f97316` (Orange)
  - Neutre: Échelle de gris moderne
- **Composants**: Cards, Badges, Toasts, Modals
- **Animations**: Transitions fluides, Fade-in, Scale-in

### Inspirations
- Vercel Dashboard
- Linear App
- Tendances UI/UX 2024

## 📁 Structure du Projet

```
agriculture_platform/
├── assets/
│   ├── app.css              # Design system principal
│   ├── components.css       # Composants UI
│   ├── app.js              # Utilitaires JavaScript
│   ├── icons.svg           # Bibliothèque d'icônes SVG
│   └── dashboard.css       # Styles spécifiques dashboard
├── database/
│   ├── install.sql         # Script d'installation
│   ├── install.php         # Installateur PHP
│   └── populate_ci_data.sql # Données CI
├── includes/
│   └── db.php             # Connexion base de données
├── pages/
│   ├── parcelles.php      # Gestion parcelles
│   ├── add_parcelle.php   # Ajout parcelle
│   ├── calculator.php     # Calculateur
│   ├── guides.php         # Liste guides
│   ├── guide_detail.php   # Détail guide
│   ├── notifications.php  # Notifications
│   └── profile.php        # Profil utilisateur
├── index.php              # Dashboard principal
├── README.md             # Ce fichier
└── GUIDE.md              # Guide utilisateur
```

## 🌾 Cultures Supportées

1. Maïs (120 jours)
2. Riz (150 jours)
3. Manioc (300 jours)
4. Cacao (5 ans)
5. Café Robusta (3 ans)
6. Palmier à huile (20 ans)
7. Hévéa (20 ans)
8. Anacarde (4 ans)
9. Banane plantain (1 an)
10. Igname (270 jours)
11. Arachide (120 jours)

## 🛠️ Technologies

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: PHP 5.5+
- **Base de données**: MySQL
- **Fonts**: Google Fonts (Plus Jakarta Sans)
- **Icons**: SVG personnalisés

## 📱 Responsive Design

- **Mobile**: 320px - 480px
- **Tablet**: 481px - 768px
- **Desktop**: 769px+

Navigation flottante adaptative avec glassmorphism.

## 🔧 Configuration

### Base de Données
Fichier: `includes/db.php`
```php
$host = 'localhost';
$dbname = 'agriculture_platform';
$username = 'root';
$password = '';
```

### Personnalisation
- **Couleurs**: `assets/app.css` (variables CSS)
- **Cultures**: `database/install.sql`
- **Tutoriels**: Table `tutoriel`

## 📊 Base de Données

### Tables Principales
- `utilisateur` - Comptes utilisateurs
- `culture` - Cultures disponibles
- `parcelle` - Parcelles des utilisateurs
- `intrant` - Intrants agricoles
- `necessiter` - Besoins par culture
- `stock` - Stock d'intrants
- `tutoriel` - Guides pratiques
- `tache` - Tâches agricoles
- `prevision_meteo` - Prévisions météo

## 🎯 Roadmap

### Version 1.1
- [ ] Authentification complète
- [ ] Gestion multi-utilisateurs
- [ ] Export PDF

### Version 1.2
- [ ] Graphiques de performance
- [ ] API météo réelle
- [ ] Mode hors-ligne (PWA)

### Version 2.0
- [ ] Application mobile native
- [ ] Marketplace intrants
- [ ] Détection maladies par IA
- [ ] Forum communautaire

## 🤝 Contribution

Les contributions sont les bienvenues !

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit (`git commit -m 'Add AmazingFeature'`)
4. Push (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT. Voir `LICENSE` pour plus d'informations.

## 👥 Auteurs

- **Développeur Principal** - Design & Développement

## 🙏 Remerciements

- Agriculteurs de Côte d'Ivoire
- Communauté open source
- Google Fonts
- Inspiration: Vercel, Linear

## 📞 Support

- **Documentation**: Voir `GUIDE.md`
- **Issues**: GitHub Issues
- **Email**: support@agriassist.ci

---

**Développé avec ❤️ pour les agriculteurs de Côte d'Ivoire**

*Version 1.0.0 - Décembre 2024*
