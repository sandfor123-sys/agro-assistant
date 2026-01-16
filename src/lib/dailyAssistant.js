import pool from './db';

export function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bonjour';
    if (hour < 18) return 'Bon après-midi';
    return 'Bonsoir';
}

export async function getWeatherAdvice() {
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
        const [parcels] = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours 
            FROM parcelle p 
            JOIN culture c ON p.id_culture = c.id_culture 
            WHERE p.id_utilisateur = ?
        `, [userId]);

        const now = new Date();
        const dayOfWeek = now.getDay();
        const isStartOfWeek = dayOfWeek === 1; // Monday
        const isEndOfWeek = dayOfWeek === 5; // Friday

        for (const p of parcels) {
            const plantingDate = new Date(p.date_semis);
            const daysSincePlanting = Math.floor((now - plantingDate) / (1000 * 60 * 60 * 24));
            const cycleProgress = (daysSincePlanting / p.cycle_vie_jours) * 100;

            if (cycleProgress >= 0 && cycleProgress < 20) {
                tasks.push({
                    parcelle: p.nom_parcelle,
                    task: 'Surveillance de la levée',
                    priority: 'high',
                    icon: '👁️',
                    id: `task-${p.id_parcelle}-monitor`,
                    personnel: false
                });
            } else if (cycleProgress >= 20 && cycleProgress < 40) {
                tasks.push({
                    parcelle: p.nom_parcelle,
                    task: 'Premier sarclage et fertilisation',
                    priority: 'high',
                    icon: '🔧',
                    id: `task-${p.id_parcelle}-weed`,
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
        tasks.push({
            parcelle: 'Système',
            task: 'Vérifier la connexion à la base de données',
            priority: 'low',
            icon: '⚠️',
            id: 'error',
            personnel: false
        });
    }

    return tasks;
}

export async function syncGroundedAlerts(userId = 1) {
    try {
        // Simplified version - just log that sync was attempted
        console.log('SyncGroundedAlerts called for user:', userId);
    } catch (error) {
        console.error('Error in syncGroundedAlerts:', error);
        // Don't throw error - just log it and continue
    }
}

export async function triggerAlertIfNotExists(userId, titre, message, type, priorite) {
    try {
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
    } catch (error) {
        console.error('Error in triggerAlertIfNotExists:', error);
    }
}
