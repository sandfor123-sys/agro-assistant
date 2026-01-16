# AgriAssist CI - Guide d'Utilisation

## 🌱 Bienvenue sur AgriAssist CI

AgriAssist CI est votre assistant agricole intelligent conçu spécialement pour les agriculteurs de Côte d'Ivoire.

## 🚀 Démarrage Rapide

### Installation
1. Assurez-vous que WAMP est démarré
2. Accédez à `http://localhost/agriculture_platform/database/install.php`
3. Cliquez sur "Installer la base de données"
4. Une fois terminé, accédez au dashboard

### Premier Lancement
1. **Ajoutez votre première parcelle**
   - Cliquez sur "Mes Parcelles"
   - Remplissez le formulaire
   - Choisissez votre culture
   - Indiquez la superficie

2. **Calculez vos besoins**
   - Allez dans "Calculateur"
   - Sélectionnez votre parcelle
   - Consultez les besoins en intrants

3. **Consultez les guides**
   - Section "Guides Pratiques"
   - Recherchez par mot-clé
   - Filtrez par catégorie

## 📱 Navigation

### Dashboard (Accueil)
- **Météo** : Température et prévisions du jour
- **Stats rapides** : Parcelles actives, récoltes du mois
- **Actions rapides** : Accès direct aux fonctionnalités
- **Parcelles en cours** : Suivi de progression

### Mes Parcelles
- **Liste** : Toutes vos parcelles avec progression
- **Ajouter** : Formulaire d'ajout de parcelle
- **Détails** : Nom, culture, superficie, phase de croissance

### Calculateur
- **Sélection** : Choisir une parcelle
- **Besoins** : Calcul automatique des intrants
  - Semences
  - Engrais
  - Traitements
- **Plants** : Nombre de plants nécessaires

### Guides Pratiques
- **Recherche** : Barre de recherche en temps réel
- **Filtres** : Par catégorie (Préparation, Plantation, etc.)
- **Détails** : Contenu complet avec instructions

### Notifications
- **Alertes stock** : Quand les ressources sont faibles
- **Tâches à venir** : Rappels pour les 7 prochains jours
- **Badge** : Nombre de notifications dans le header

### Profil
- **Informations** : Nom, email
- **Statistiques** : Parcelles, cultures, jours actif
- **Paramètres** : Préférences (à venir)

## 🎨 Fonctionnalités

### Calculs Automatiques
- **Intrants par hectare** : Basé sur les recommandations
- **Quantité totale** : Superficie × Besoin/ha
- **Nombre de plants** : Selon l'espacement

### Suivi de Progression
- **Phases** : Début → Croissance → Récolte
- **Pourcentage** : Jours écoulés / Cycle total
- **Barre visuelle** : Progression colorée

### Système de Notifications
- **Temps réel** : Toast notifications
- **Types** : Success, Error, Warning, Info
- **Auto-dismiss** : Disparaît après 3 secondes

## 🌾 Cultures Disponibles

1. **Maïs** - 120 jours
2. **Riz** - 150 jours
3. **Manioc** - 300 jours
4. **Cacao** - 5 ans
5. **Café Robusta** - 3 ans
6. **Palmier à huile** - 20 ans
7. **Hévéa** - 20 ans
8. **Anacarde** - 4 ans
9. **Banane plantain** - 1 an
10. **Igname** - 270 jours
11. **Arachide** - 120 jours

## 💡 Conseils d'Utilisation

### Pour Débutants
1. Commencez avec une seule parcelle
2. Consultez les guides avant de planter
3. Utilisez le calculateur pour estimer vos besoins
4. Suivez les notifications pour les tâches

### Pour Utilisateurs Avancés
1. Gérez plusieurs parcelles simultanément
2. Comparez les besoins entre cultures
3. Planifiez vos récoltes avec les dates estimées
4. Exportez vos données (à venir)

## 🔧 Dépannage

### La base de données ne s'installe pas
- Vérifiez que WAMP est démarré (icône verte)
- Vérifiez que MySQL fonctionne
- Essayez de redémarrer WAMP

### Les images ne s'affichent pas
- Les icônes sont en SVG, pas besoin d'images
- Si problème, videz le cache du navigateur

### Erreur PHP
- Vérifiez la version PHP (5.5+)
- Vérifiez que PDO est activé
- Consultez les logs d'erreur WAMP

## 📞 Support

Pour toute question :
- Consultez d'abord les guides pratiques
- Vérifiez la section Notifications
- Contactez le support technique

## 🎯 Prochaines Fonctionnalités

- [ ] Export PDF des calculs
- [ ] Graphiques de performance
- [ ] Mode hors-ligne
- [ ] Marketplace intrants
- [ ] Détection maladies par IA

---

**Version 1.0.0** - Développé pour les agriculteurs de Côte d'Ivoire
