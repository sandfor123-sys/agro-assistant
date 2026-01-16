import { NextResponse } from 'next/server';

async function processQuery(query, userId = 1) {
    const q = query.toLowerCase();
    
    // Météo
    if (q.includes('météo') || q.includes('meteo') || q.includes('temps') || q.includes('climat')) {
        return {
            type: 'weather',
            text: `🌤️ **Prévisions météo actuelles**\n\n• Température : 32°C\n• Conditions : Ensoleillé\n• Humidité : 65%\n• Vent : 12 km/h\n\n**Conseil agricole** : C'est une bonne journée pour les traitements phytosanitaires. Évitez l'arrosage pendant les heures chaudes.`,
            data: [
                { icon: '☀️', parcelle: 'Météo', task: 'Température idéale pour les cultures' },
                { icon: '💧', parcelle: 'Irrigation', task: 'Arroser tôt le matin ou tard le soir' }
            ]
        };
    }
    
    // Tâches
    if (q.includes('tâche') || q.includes('faire') || q.includes('travail') || q.includes('todo')) {
        return {
            type: 'tasks',
            text: `📋 **Vos tâches prioritaires aujourd'hui**\n\nVous avez 3 tâches en attente :\n\n1. 🌱 **Surveillance des semis** - Parcelle Nord\n2. 🔧 **Entretien matériel** - Vérifier pulvérisateur\n3. 💧 **Planification irrigation** - Zone Est`,
            data: [
                { icon: '👁️', parcelle: 'Parcelle Nord', task: 'Surveillance de la levée' },
                { icon: '🔧', parcelle: 'Matériel', task: 'Vérifier pulvérisateur' },
                { icon: '💧', parcelle: 'Zone Est', task: 'Planification irrigation' }
            ]
        };
    }
    
    // Conseils financiers
    if (q.includes('conseil') || q.includes('argent') || q.includes('finance') || q.includes('économ')) {
        return {
            type: 'financial',
            text: `💰 **Conseil financier du jour**\n\n**Optimisation des coûts** :\n• Achetez les engrais en gros (10-15% d'économie)\n• Regroupez vos livraisons pour réduire les frais de transport\n• Comparez les prix avant les gros achats\n\n**Investissement intelligent** :\n• Privilégiez les matériel polyvalents\n• Envisagez la location pour les équipements coûteux\n• Suivez vos dépenses quotidiennement`,
            data: [
                { icon: '🛒', parcelle: 'Achats', task: 'Comparer les prix fournisseurs' },
                { icon: '📊', parcelle: 'Budget', task: 'Suivre les dépenses quotidiennes' }
            ]
        };
    }
    
    // Calculateur de rentabilité
    if (q.includes('rentabilité') || q.includes('calculer') || q.includes('marge') || q.includes('profit') || q.includes('bénéfice')) {
        return {
            type: 'calculator',
            text: `🧮 **Calculateur de rentabilité**\n\nJe peux vous aider à calculer :\n• Coûts de production\n• Revenus estimés\n• Marges bénéficiaires\n• Seuil de rentabilité\n\n**Informations nécessaires** :\n• Type de culture\n• Surface cultivée\n• Coûts des intrants\n• Prix de vente estimé`,
            link: '/dashboard/calculator',
            data: [
                { icon: '🌾', parcelle: 'Culture', task: 'Choisir le type de culture' },
                { icon: '📏', parcelle: 'Surface', task: 'Définir la superficie' }
            ]
        };
    }
    
    // Guide d'utilisation
    if (q.includes('guide') || q.includes('utiliser') || q.includes('aide') || q.includes('comment') || q.includes('formation')) {
        return {
            type: 'guide',
            text: `📚 **Guide d'utilisation AgriAssist**\n\n**Modules disponibles** :\n\n🌾 **Parcelles** - Gérez vos cultures\n📦 **Stock** - Suivez vos intrants\n🧮 **Calculateurs** - Optimisez vos investissements\n⚠️ **Alertes** - Signalez les problèmes\n📊 **Tableau de bord** - Vue d'ensemble\n\n**Pour commencer** :\n1. Créez vos parcelles\n2. Ajoutez votre stock\n3. Utilisez les calculateurs\n4. Suivez vos alertes`,
            link: '/dashboard/guide',
            data: [
                { icon: '🌾', parcelle: 'Étape 1', task: 'Créer vos parcelles' },
                { icon: '📦', parcelle: 'Étape 2', task: 'Ajouter votre stock' },
                { icon: '🧮', parcelle: 'Étape 3', task: 'Utiliser les calculateurs' }
            ]
        };
    }
    
    // Maladies et traitements
    if (q.includes('maladie') || q.includes('ravageur') || q.includes('traitement') || q.includes('santé') || q.includes('phyto')) {
        return {
            type: 'health',
            text: `🌿 **Conseils phytosanitaires**\n\n**Détection précoce** :\n• Inspectez vos parcelles 2-3 fois par semaine\n• Surveillez les feuilles (jaunissement, taches)\n• Vérifiez les tiges et les fruits\n\n**Traitements préventifs** :\n• Appliquez des fongicides en période humide\n• Utilisez des insecticides naturels\n• Pratiquez la rotation des cultures\n\n**Stock recommandé** :\n• Fongicide à large spectre\n• Insecticide biologique\n• Stimulateur de défenses naturelles`,
            data: [
                { icon: '🔍', parcelle: 'Surveillance', task: 'Inspection 3x par semaine' },
                { icon: '🌿', parcelle: 'Prévention', task: 'Traitements naturels' }
            ]
        };
    }
    
    // Irrigation
    if (q.includes('irrigation') || q.includes('eau') || q.includes('arrosage') || q.includes('pluie')) {
        return {
            type: 'irrigation',
            text: `💧 **Gestion optimisée de l'irrigation**\n\n**Programme recommandé** :\n• **Matin (5h-8h)** : 60% des besoins\n• **Soir (17h-19h)** : 40% des besoins\n• Éviter 11h-16h (évaporation forte)\n\n**Techniques efficaces** :\n• Goutte-à-goutte : -40% d'eau\n• Paillage : -30% d'évaporation\n• Capteurs d'humidité : Optimisation en temps réel\n\n**Besoin par culture** :\n• Maïs : 25-30mm/semaine\n• Tomates : 20-25mm/semaine\n• Légumes : 15-20mm/semaine`,
            data: [
                { icon: '⏰', parcelle: 'Programmation', task: 'Arrosage tôt matin et soir' },
                { icon: '💧', parcelle: 'Économie', task: 'Goutte-à-goutte + paillage' }
            ]
        };
    }
    
    // Réponse par défaut
    return {
        type: 'help',
        text: `🤖 **AgriAssist - Votre conseiller agricole**\n\nJe peux vous aider avec :\n\n🌤️ **Météo** - Prévisions et conseils\n📋 **Tâches** - Planning quotidien\n💰 **Finances** - Optimisation des coûts\n🧮 **Calculs** - Rentabilité et intrants\n📚 **Formation** - Guides et tutoriels\n🌿 **Santé** - Maladies et traitements\n💧 **Irrigation** - Gestion de l'eau\n\n**Essayez** : "guide", "météo", "tâches", "calculateur"`,
        data: [
            { icon: '🌤️', parcelle: 'Météo', task: 'Prévisions et conseils' },
            { icon: '📋', parcelle: 'Tâches', task: 'Planning quotidien' },
            { icon: '💰', parcelle: 'Finances', task: 'Optimisation coûts' }
        ]
    };
}

export async function POST(request) {
    try {
        const { query, userId } = await request.json();
        const response = await processQuery(query, userId || 1);
        return NextResponse.json(response);
    } catch (error) {
        console.error('API Assistant Error:', error);
        return NextResponse.json(
            { 
                type: 'error',
                text: "Désolé, je rencontre une difficulté technique. Veuillez réessayer." 
            },
            { status: 500 }
        );
    }
}
