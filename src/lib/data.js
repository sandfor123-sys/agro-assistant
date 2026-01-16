import pool from './db';

// Local functions to avoid dependency issues
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
}

async function getWeatherAdvice() {
    const conditions = [
        { icon: '☀️', temp: '32°C', desc: 'Ensoleillé', advice: 'Arrosez tôt le matin' },
        { icon: '🌧️', temp: '28°C', desc: 'Pluie prévue', advice: 'Pas d\'arrosage nécessaire' },
        { icon: '⛅', temp: '30°C', desc: 'Nuageux', advice: 'Bon moment pour désherber' },
    ];
    return conditions[Math.floor(Math.random() * conditions.length)];
}

async function getImmediateAction() {
    const actions = [
        { icon: '💧', message: 'Vérifier l\'arrosage des jeunes plants', link: '/dashboard/parcels' },
        { icon: '🌱', message: 'Inspecter les parcelles pour détecter maladies', link: '/dashboard/parcels' },
        { icon: '📊', message: 'Mettre à jour votre inventaire de stock', link: '/dashboard/inventory' },
    ];
    return actions[Math.floor(Math.random() * actions.length)];
}

async function getFinancialTip() {
    const tips = [
        "💡 Astuce : Achetez vos intrants en groupe pour réduire les coûts de 20%",
        "💰 Pensez à diversifier vos cultures pour réduire les risques financiers",
        "📊 Tenez un registre quotidien de vos dépenses pour mieux planifier"
    ];
    return tips[Math.floor(Math.random() * tips.length)];
}

async function getWeeklyTasks(userId = 1) {
    const tasks = [];
    try {
        // Récupérer les parcelles de l'utilisateur avec leurs infos
        const parcellesResult = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p 
            JOIN culture c ON p.id_culture = c.id_culture 
            WHERE p.id_utilisateur = $1 AND p.statut = 'en_cours'
        `, [userId]);

        const parcelles = parcellesResult.rows;

        const now = new Date();
        
        for (const parcelle of parcelles) {
            const plantingDate = new Date(parcelle.date_semis);
            const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
            const progress = Math.min(100, Math.round((daysSincePlanting / parcelle.cycle_vie_jours) * 100));
            
            // Générer des tâches selon le stade de croissance
            if (progress < 10) {
                // Phase de germination (0-10%)
                tasks.push({
                    id: `germination-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Vérifier la germination des semences",
                    priority: "high",
                    icon: "🌱",
                    personnel: false
                });
                tasks.push({
                    id: `arrosage-jeune-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Arrosage léger des jeunes plants",
                    priority: "urgent",
                    icon: "💧",
                    personnel: false
                });
            } else if (progress < 30) {
                // Phase de croissance initiale (10-30%)
                tasks.push({
                    id: `desherbage-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Désherbage autour des jeunes plants",
                    priority: "high",
                    icon: "🌿",
                    personnel: false
                });
                tasks.push({
                    id: `fertilisation-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Première fertilisation légère",
                    priority: "medium",
                    icon: "🌾",
                    personnel: false
                });
            } else if (progress < 60) {
                // Phase de croissance active (30-60%)
                tasks.push({
                    id: `surveillance-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Surveiller les signes de maladies",
                    priority: "medium",
                    icon: "🔍",
                    personnel: false
                });
                tasks.push({
                    id: `arrosage-regulier-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Maintenir l'arrosage régulier",
                    priority: "medium",
                    icon: "💧",
                    personnel: false
                });
            } else if (progress < 90) {
                // Phase de maturation (60-90%)
                tasks.push({
                    id: `protection-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Appliquer traitements pré-récolte si nécessaire",
                    priority: "high",
                    icon: "🛡️",
                    personnel: false
                });
                tasks.push({
                    id: `preparation-recolte-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Préparer le matériel de récolte",
                    priority: "low",
                    icon: "🚜",
                    personnel: false
                });
            } else {
                // Pré-récolte (90-100%)
                tasks.push({
                    id: `evaluation-recolte-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Évaluer la maturité pour la récolte",
                    priority: "urgent",
                    icon: "📊",
                    personnel: false
                });
            }
            
            // Tâches de maintenance générales
            if (Math.random() > 0.7) {
                tasks.push({
                    id: `nettoyage-${parcelle.id_parcelle}`,
                    parcelle: parcelle.nom_parcelle,
                    task: "Nettoyer les contours de la parcelle",
                    priority: "low",
                    icon: "🧹",
                    personnel: true
                });
            }
        }
        
        // Ajouter des tâches administratives
        tasks.push({
            id: "inventaire",
            parcelle: "Administration",
            task: "Mettre à jour l'inventaire des intrants",
            priority: "medium",
            icon: "📦",
            personnel: false
        });
        
        // Limiter à 8 tâches maximum pour ne pas surcharger
        return tasks.slice(0, 8);
        
    } catch (error) {
        console.error("Error generating dynamic tasks:", error);
        // En cas d'erreur, retourner une tâche par défaut
        return [{
            parcelle: "Système",
            task: "Vérifier l'état des cultures",
            priority: "medium",
            icon: "⚠️",
            id: "error-task",
            personnel: false
        }];
    }
}

async function syncGroundedAlerts(userId = 1) {
    try {
        console.log("SyncGroundedAlerts called for user:", userId);
    } catch (error) {
        console.error("Error in syncGroundedAlerts:", error);
    }
}

export async function getDashboardData(userId = 1) {
    try {
        // Sync alerts based on simulation phase before fetching data
        await syncGroundedAlerts(userId);

        const [
            nbParcellesResult,
            nbAlertesResult,
            recentParcelles,
            weather,
            action,
            financialTip,
            weeklyTasks
        ] = await Promise.all([
            pool.query('SELECT COUNT(*) as count FROM parcelle WHERE id_utilisateur = $1', [userId]),
            pool.query('SELECT COUNT(*) as count FROM alerte WHERE id_utilisateur = $1 AND lu = 0', [userId]),
            pool.query(`
        SELECT p.*, c.nom_culture, c.couleur 
        FROM parcelle p 
        JOIN culture c ON p.id_culture = c.id_culture 
        WHERE p.id_utilisateur = $1 
        ORDER BY p.date_semis DESC 
        LIMIT 5
      `, [userId]),
            getWeatherAdvice(),
            getImmediateAction(),
            getFinancialTip(),
            getWeeklyTasks(userId)
        ]);

        const stats = {
            parcelles: nbParcellesResult.rows[0]?.count || 0,
            alertes: nbAlertesResult.rows[0]?.count || 0,
            revenus: '2.4M', // Hardcoded as per PHP original
            successRate: '92%' // Hardcoded as per PHP original
        };

        let user = { prenom: 'Jean', nom: 'Kouassi' };

        try {
            const userResult = await pool.query('SELECT prenom, nom FROM utilisateur WHERE id_utilisateur = $1', [userId]);
            if (userResult.rows.length > 0) {
                user = userResult.rows[0];
            }
        } catch (error) {
            console.error('User fetch failed, utilizing fallback');
        }

        const greeting = await getGreeting();

        return {
            user,
            greeting,
            stats,
            weather,
            action,
            financialTip,
            weeklyTasks,
            recentParcelles: recentParcelles.rows
        };

    } catch (error) {
        console.error('getDashboardData Error:', error);
        throw new Error('Failed to fetch dashboard data');
    }
}
export async function getAlerts(userId = 1) {
    try {
        const result = await pool.query(`
            SELECT a.* 
            FROM alerte a
            WHERE a.id_utilisateur = $1
            ORDER BY a.date_creation DESC
        `, [userId]);
        return result.rows;
    } catch (error) {
        console.error('getAlerts Error:', error);
        return [];
    }
}

export async function getTrackingData(userId = 1) {
    try {
        const result = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p
            JOIN culture c ON p.id_culture = c.id_culture
            WHERE p.id_utilisateur = $1
            ORDER BY p.date_semis DESC
        `, [userId]);
        return result.rows;
    } catch (error) {
        console.error('getTrackingData Error:', error);
        throw new Error('Failed to fetch tracking data');
    }
}
