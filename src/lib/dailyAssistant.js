import pool from './db';

/**
 * AgriAssist Intelligence Layer
 * Migrated from PHP DailyAssistant class
 */

export async function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
}

export async function getWeatherAdvice() {
    // Mock data as per original PHP version (would connect to API in prod)
    const conditions = [
        { icon: '☀️', temp: '32°C', desc: 'Ensoleillé', advice: 'Arrosez tôt le matin' },
        { icon: '🌧️', temp: '28°C', desc: 'Pluie prévue', advice: 'Pas d\'arrosage nécessaire' },
        { icon: '⛅', temp: '30°C', desc: 'Nuageux', advice: 'Bon moment pour désherber' },
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
}

export async function getImmediateAction() {
    const actions = [
        { icon: '💧', message: 'Vérifier l\'arrosage des jeunes plants', link: '/dashboard/parcels' },
        { icon: '🌱', message: 'Inspecter les parcelles pour détecter maladies', link: '/dashboard/parcels' },
        { icon: '📊', message: 'Mettre à jour votre inventaire de stock', link: '/dashboard/inventory' },
    ];
    return actions[Math.floor(Math.random() * actions.length)];
}

export async function getFinancialTip() {
    const tips = [
        "💡 Astuce : Achetez vos intrants en groupe pour réduire les coûts de 20%",
        "💰 Pensez à diversifier vos cultures pour réduire les risques financiers",
        "📊 Tenez un registre quotidien de vos dépenses pour mieux planifier"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

export async function getWeeklyTasks(userId = 1) {
    const tasks = [];

    try {
        // 0. Fetch recent alerts to adapt tasks
        const [recentAlerts] = await pool.query(
            "SELECT type, titre FROM alerte WHERE id_utilisateur = ? AND date_creation >= DATE_SUB(NOW(), INTERVAL 3 DAY) ORDER BY date_creation DESC LIMIT 5",
            [userId]
        );

        const alertContexts = recentAlerts.map(a => ({ type: a.type, titre: a.titre }));

        // 1. Fetch active parcels
        const [parcels] = await pool.query(`
      SELECT p.*, c.nom_culture, c.cycle_vie_jours 
      FROM parcelle p 
      JOIN culture c ON p.id_culture = c.id_culture 
      WHERE p.id_utilisateur = ? 
      ORDER BY p.date_semis DESC
    `, [userId]);

        // 2. Fetch stocks
        const [stockRows] = await pool.query(
            "SELECT id_intrant, quantite_actuelle FROM stock WHERE id_utilisateur = ?",
            [userId]
        );

        // Map stocks to object { id: quantite }
        const stocks = stockRows.reduce((acc, row) => {
            acc[row.id_intrant] = row.quantite_actuelle;
            return acc;
        }, {});

        // 3. Generate tasks logic
        // Using current time
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Dimanche, 1=Lundi...
        const isStartOfWeek = dayOfWeek === 1;
        const isEndOfWeek = dayOfWeek === 5;

        // --- Daily General Farm Tasks ---
        tasks.push({
            parcelle: 'Général',
            task: 'Contrôle des équipements et outils (motopompes, pulvérisateurs)',
            priority: 'medium',
            icon: '🔧',
            id: `daily-equipment-${now.toDateString()}`,
            personnel: false
        });

        tasks.push({
            parcelle: 'Général',
            task: 'Inspection des clôtures et portails',
            priority: 'medium',
            icon: '🚪',
            id: `daily-fences-${now.toDateString()}`,
            personnel: false
        });

        if (dayOfWeek % 2 === 0) {
            tasks.push({
                parcelle: 'Général',
                task: 'Nettoyage des zones de stockage et hangars',
                priority: 'medium',
                icon: '🧹',
                id: `cleaning-${now.toDateString()}`,
                personnel: true
            });
        }

        if (isStartOfWeek) {
            tasks.push({
                parcelle: 'Personnel',
                task: 'Briefing hebdomadaire : objectifs et sécurité',
                priority: 'high',
                icon: '👥',
                id: `briefing-${now.toDateString()}`,
                personnel: true
            });
        }

        if (isEndOfWeek) {
            tasks.push({
                parcelle: 'Personnel',
                task: 'Point de fin de semaine : rendement et incidents',
                priority: 'medium',
                icon: '📊',
                id: `review-${now.toDateString()}`,
                personnel: true
            });
        }

        // --- Contextual Tasks from Recent Alerts ---
        const hasPestAlert = alertContexts.some(a => a.type === 'alerte' && (a.titre.toLowerCase().includes('criquet') || a.titre.toLowerCase().includes('ravageur')));
        const hasStockAlert = alertContexts.some(a => a.type === 'stock');
        const hasHealthAlert = alertContexts.some(a => a.type === 'alerte' && a.titre.toLowerCase().includes('maladie'));

        if (hasPestAlert) {
            tasks.push({
                parcelle: 'Phytosanitaire',
                task: 'Surveillance accrue des ravageurs (pièges et observations)',
                priority: 'high',
                icon: '🔍',
                id: `pest-monitoring-${now.toDateString()}`,
                personnel: true
            });
        }

        if (hasHealthAlert) {
            tasks.push({
                parcelle: 'Phytosanitaire',
                task: 'Application de traitement préventif (selles recommandées)',
                priority: 'urgent',
                icon: '🧪',
                id: `health-treatment-${now.toDateString()}`,
                personnel: false
            });
        }

        if (hasStockAlert) {
            tasks.push({
                parcelle: 'Stock',
                task: 'Vérification des stocks et planification des réapprovisionnements',
                priority: 'high',
                icon: '📦',
                id: `stock-check-${now.toDateString()}`,
                personnel: true
            });
        }

        // --- Irrigation System Checks (CI context) ---
        if (dayOfWeek % 3 === 0) {
            tasks.push({
                parcelle: 'Irrigation',
                task: 'Contrôle du système d\'irrigation (goutteurs, canaux, pompe)',
                priority: 'high',
                icon: '💧',
                id: `irrigation-check-${now.toDateString()}`,
                personnel: false
            });
        }

        // --- Market/Logistics Tasks ---
        if (dayOfWeek === 4) {
            tasks.push({
                parcelle: 'Logistique',
                task: 'Préparation des livraisons de la semaine (caisses, transport)',
                priority: 'medium',
                icon: '🚚',
                id: `market-prep-${now.toDateString()}`,
                personnel: true
            });
        }

        // --- Parcel-Specific Tasks ---
        for (const p of parcels) {
            const plantingDate = new Date(p.date_semis);
            const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
            const cycleProgress = (daysSincePlanting / p.cycle_vie_jours) * 100;

            // --- Recurring Daily Tasks ---
            if (cycleProgress < 80) {
                tasks.push({
                    parcelle: p.nom_parcelle,
                    task: cycleProgress < 20 ? `Arrosage matinal (Crucial - Jeunes ${p.nom_culture})` : `Arrosage de maintien (${p.nom_culture})`,
                    priority: cycleProgress < 20 ? 'high' : 'medium',
                    icon: '💧',
                    id: `watering-${p.id_parcelle}-${daysSincePlanting}`,
                    personnel: false
                });
            }

            // --- Crop Specific Knowledge (Ivorian Context) ---
            if (p.nom_culture === 'Cacao') {
                if (daysSincePlanting > 30 && daysSincePlanting < 60) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Taille de formation des jeunes cacaoyers',
                        priority: 'medium',
                        icon: '✂️',
                        id: `cacao-pruning-${p.id_parcelle}`,
                        personnel: true
                    });
                }
                if (cycleProgress > 70 && cycleProgress < 90) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Récolte sélective des cabosses mûres',
                        priority: 'high',
                        icon: '🍫',
                        id: `cacao-harvest-${p.id_parcelle}`,
                        personnel: true
                    });
                }
            } else if (p.nom_culture === 'Manioc' || p.nom_culture === 'Manioc') {
                if (cycleProgress > 30 && cycleProgress < 40) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Deuxième sarclage (Indispensable pour le Manioc)',
                        priority: 'high',
                        icon: '🌿',
                        id: `manioc-weeding-${p.id_parcelle}`,
                        personnel: true
                    });
                }
                if (cycleProgress > 80) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Arrachage du manioc et préparation pour commercialisation',
                        priority: 'urgent',
                        icon: '🥔',
                        id: `manioc-harvest-${p.id_parcelle}`,
                        personnel: true
                    });
                }
            } else if (p.nom_culture === 'Maïs') {
                if (daysSincePlanting > 15 && daysSincePlanting < 25) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Démariage : Ne laisser que 2 plants par poquet',
                        priority: 'high',
                        icon: '🌱',
                        id: `mais-demariage-${p.id_parcelle}`,
                        personnel: true
                    });
                }
                if (cycleProgress > 60 && cycleProgress < 80) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Surveillance des foreurs et chenilles',
                        priority: 'high',
                        icon: '🐛',
                        id: `mais-pest-${p.id_parcelle}`,
                        personnel: false
                    });
                }
            } else if (p.nom_culture === 'Ananas') {
                if (cycleProgress > 40 && cycleProgress < 60) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: 'Paillage et protection contre le soleil',
                        priority: 'medium',
                        icon: '🍍',
                        id: `ananas-mulch-${p.id_parcelle}`,
                        personnel: true
                    });
                }
            }

            // --- Growth Stage Specific Tasks ---
            if (cycleProgress >= 40 && cycleProgress <= 60) {
                const hasFertilizer = stocks[1] && stocks[1] > 0;
                if (hasFertilizer) {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: `Apport d'engrais NPK conseillé (${p.nom_culture})`,
                        priority: 'high',
                        icon: '🧪',
                        id: `task-${p.id_parcelle}-fert`,
                        personnel: false
                    });
                } else {
                    tasks.push({
                        parcelle: p.nom_parcelle,
                        task: '⚠️ Acheter Engrais (Stock critique)',
                        priority: 'urgent',
                        icon: '🛒',
                        id: `task-${p.id_parcelle}-buy-fert`,
                        personnel: false
                    });
                }
            } else if (cycleProgress >= 85 && cycleProgress < 100) {
                tasks.push({
                    parcelle: p.nom_parcelle,
                    task: `Préparation récolte : nettoyage caisses et outils`,
                    priority: 'high',
                    icon: '🧺',
                    id: `task-${p.id_parcelle}-prep-harvest`,
                    personnel: true
                });
            } else if (cycleProgress >= 100) {
                tasks.push({
                    parcelle: p.nom_parcelle,
                    task: `🚨 RÉCOLTE DE ${p.nom_culture.toUpperCase()} URGENTE`,
                    priority: 'urgent',
                    icon: '🚜',
                    id: `task-${p.id_parcelle}-harvest-overdue`,
                    personnel: true
                });
            }
        }

        if (tasks.length === 0) {
            tasks.push({
                parcelle: 'Général',
                task: 'Créer votre première parcelle',
                priority: 'high',
                icon: '🌱',
                id: 'task-generic',
                personnel: false
            });
        }

    } catch (error) {
        console.error("Error generating tasks:", error);
        // Return safe fallback
        tasks.push({
            parcelle: 'Système',
            task: 'Erreur de chargement des tâches',
            priority: 'low',
            icon: '⚠️',
            id: 'error',
            personnel: false
        });
    }

    return tasks;
}
export async function processQuery(query, userId = 1) {
    const q = query.toLowerCase();

    if (q.includes('météo') || q.includes('meteo') || q.includes('temps')) {
        const weather = await getWeatherAdvice();
        return {
            type: 'weather',
            text: `Voici les prévisions : Il fait ${weather.temp} et le ciel est ${weather.desc}. ${weather.advice}.`,
            data: weather
        };
    }

    if (q.includes('tâche') || q.includes('faire') || q.includes('travail')) {
        const tasks = await getWeeklyTasks(userId);
        return {
            type: 'tasks',
            text: `Vous avez ${tasks.length} tâches prioritaires aujourd'hui. Voici les principales :`,
            data: tasks.slice(0, 3)
        };
    }

    if (q.includes('conseil') || q.includes('argent') || q.includes('finance')) {
        const tip = await getFinancialTip();
        return {
            type: 'tip',
            text: tip,
            data: null
        };
    }

    if (q.includes('rentabilité') || q.includes('calculer') || q.includes('marge')) {
        return {
            type: 'link',
            text: "Je peux vous aider à simuler vos profits. Voulez-vous ouvrir le calculateur de rentabilité ?",
            link: '/dashboard/calculator'
        };
    }

    if (q.includes('utiliser') || q.includes('comment') || q.includes('aide') || q.includes('guide')) {
        return {
            type: 'help',
            text: "Voici comment utiliser AgriAssist efficacement :\n\n📊 **Tableau de bord** : Vue d'ensemble avec vos tâches quotidiennes et alertes\n🌾 **Parcelles** : Suivez vos cultures, leur progression et gérez-les\n🧮 **Calculateurs** : Estimez vos besoins en intrants et la rentabilité\n📦 **Stock** : Gérez vos intrants et quantités disponibles\n⚠️ **Alertes** : Signalez des incidents et suivez l'état de vos parcelles\n\n💡 **Astuce** : Commencez par créer vos parcelles, puis ajoutez vos intrants en stock pour des calculs précis.",
            data: null
        };
    }

    if (q.includes('maladie') || q.includes('ravageur') || q.includes('traitement')) {
        return {
            type: 'advice',
            text: "🌿 **Conseils phytosanitaires** :\n\n• **Prévention** : Inspectez vos parcelles 2-3 fois par semaine\n• **Signes** : Taches jaunes, feuilles qui jaunissent, présence d'insectes\n• **Actions** : Retirez les parties atteintes, appliquez des traitements biologiques\n• **Stock** : Gardez des fongicides et insecticides adaptés à vos cultures\n\nUtilisez la section 'Alertes' pour documenter les problèmes et suivre les traitements.",
            data: null
        };
    }

    if (q.includes('irrigation') || q.includes('eau') || q.includes('arrosage')) {
        return {
            type: 'advice',
            text: "💧 **Gestion de l'irrigation** :\n\n• **Matin** : Arrosez tôt le matin pour réduire l'évaporation\n• **Fréquence** : Adaptée au stade de la culture et au type de sol\n• **Quantité** : Environ 30-35mm par semaine pour la plupart des cultures\n• **Économie** : Utilisez le paillage et le goutte-à-goutte\n\nLe calculateur d'intrants peut vous aider à estimer vos besoins en eau.",
            data: null
        };
    }

    if (q.includes('récolte') || q.includes('cueillette') || q.includes('vendre')) {
        return {
            type: 'advice',
            text: "🚜 **Optimisation de la récolte** :\n\n• **Timing** : Récoltez à maturité pour une meilleure qualité\n• **Stockage** : Préparez vos caisses et zones de stockage\n• **Logistique** : Planifiez le transport vers les marchés\n• **Prix** : Surveillez les prix du marché pour vendre au meilleur moment\n\nUtilisez le calculateur de rentabilité pour estimer vos revenus potentiels.",
            data: null
        };
    }

    if (q.includes('sol') || q.includes('amendement') || q.includes('fertilisation')) {
        return {
            type: 'advice',
            text: "📊 **Analyse et amendement du sol** :\n\n• **Analyse** : Faites analyser votre sol tous les 2-3 ans\n• **pH** : Visez 6.0-6.5 pour la plupart des cultures\n• **Matière organique** : Ajoutez du compost ou fumier bien décomposé\n• **Couverture végétale** : Utilisez des engrais verts entre les cultures\n• **Rotation** : Alternez les cultures pour préserver la fertilité\n\nLe calculateur d'intrants peut vous aider à planifier les apports.",
            data: null
        };
    }

    if (q.includes('matériel') || q.includes('équipement') || q.includes('maintenance')) {
        return {
            type: 'advice',
            text: "🚜 **Entretien du matériel agricole** :\n\n• **Mensuel** : Vérifiez niveaux d'huile, pression des pneus\n• **Saisonnier** : Nettoyage complet avant stockage prolongé\n• **Moteur** : Changez filtres et bougies selon préconisations\n• **Outils** : Affûtez et nettoyez après chaque utilisation\n• **Stockage** : Protégez de l'humidité et de la rouille\n\nPlanifiez l'entretien dans vos tâches régulières.",
            data: null
        };
    }

    if (q.includes('marché') || q.includes('prix') || q.includes('vente')) {
        return {
            type: 'advice',
            text: "📈 **Prévisions et tendances du marché** :\n\n• **Saisonnalité** : Les prix varient selon les périodes de récolte\n• **Qualité** : Les produits certifiés obtiennent de meilleurs prix\n• **Groupement** : Vendez en groupe pour négocier de meilleurs tarifs\n• **Diversification** : Ne dépendez pas d'un seul marché\n• **Contrats** : Envisagez des contrats avec des transformateurs\n\nSurveillez les tendances pour optimiser vos ventes.",
            data: null
        };
    }

    if (q.includes('variété') || q.includes('semence') || q.includes('culture')) {
        return {
            type: 'advice',
            text: "🌱 **Choix des variétés adaptées** :\n\n• **Climat** : Choisissez des variétés résistantes à votre zone\n• **Cycle** : Adaptez la durée de culture à votre saison\n• **Résistance** : Privilégiez les variétés tolérantes aux maladies locales\n• **Rendement** : Équilibrez rendement et qualité\n• **Marché** : Vérifiez la demande pour chaque variété\n\nTestez nouvelles variétés sur petites surfaces d'abord.",
            data: null
        };
    }

    return {
        type: 'text',
        text: "Je peux vous aider avec :\n\n🌤️ **Météo** : Prévisions et conseils agricoles\n📋 **Tâches** : Vos priorités quotidiennes\n💰 **Conseils financiers** : Optimisez vos investissements\n🧮 **Calculateurs** : Rentabilité et intrants\n📖 **Guide d'utilisation** : Comment utiliser AgriAssist\n🌿 **Conseils culturaux** : Maladies, irrigation, récolte\n📊 **Analyse du sol** : Recommandations d'amendement\n🚜 **Entretien matériel** : Planification maintenance\n📈 **Prévisions de marché** : Tendances des prix\n🌱 **Variétés adaptées** : Choix des cultures\n\nEssayez de me demander l'une de ces options !",
        data: null
    };
}

/**
 * Sync Grounded Alerts based on Simulation State
 * Auto-triggers alerts if certain conditions match the growth stage
 */
export async function syncGroundedAlerts(userId = 1) {
    try {
        const [parcels] = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours 
            FROM parcelle p 
            JOIN culture c ON p.id_culture = c.id_culture 
            WHERE p.id_utilisateur = ? AND p.statut = 'en_cours'
        `, [userId]);

        const now = new Date();

        for (const p of parcels) {
            const plantingDate = new Date(p.date_semis);
            const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));

            // Example Rule: Maïs needs weeding at day 30
            if (p.nom_culture === 'Maïs' && daysSincePlanting >= 30 && daysSincePlanting <= 35) {
                await triggerAlertIfNotExists(userId,
                    'Besoin de Désherbage (Maïs)',
                    `Votre parcelle ${p.nom_parcelle} a atteint 30 jours. Un sarclage est recommandé pour éviter la concurrence des mauvaises herbes.`,
                    'tache', 'moyenne'
                );
            }

            // Example Rule: Stress hydrique simulation (random but grounded in "no sensor" context)
            if (daysSincePlanting % 15 === 0 && daysSincePlanting > 0) {
                await triggerAlertIfNotExists(userId,
                    'Stress hydrique possible',
                    `Basé sur le cycle de votre culture (${p.nom_culture}), un arrosage intensif est nécessaire cette semaine pour la phase actuelle.`,
                    'alerte', 'haute'
                );
            }
        }
    } catch (error) {
        console.error("Sync Alerts Error:", error);
    }
}

async function triggerAlertIfNotExists(userId, titre, message, type, priorite) {
    // Basic check to avoid flooding
    const [existing] = await pool.query(
        "SELECT id_alerte FROM alerte WHERE id_utilisateur = ? AND titre = ? AND lu = 0 LIMIT 1",
        [userId, titre]
    );

    if (existing.length === 0) {
        await pool.query(
            "INSERT INTO alerte (titre, message, type, priorite, lu, id_utilisateur, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [titre, message, String(type).slice(0, 50), priorite, 0, userId, new Date()]
        );
    }
}
