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

import { predictionEngine } from './predictionEngine';

export async function getWeeklyTasks(userId = 1) {
    const tasks = [];
    try {
        const [parcels] = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p 
            JOIN culture c ON p.id_culture = c.id_culture 
            WHERE p.id_utilisateur = $1 AND p.statut = 'en_cours'
        `, [userId]);

        // Mock weather for now - in future connect to a real API
        const weather = await getWeatherAdvice();

        for (const p of parcels?.rows || []) {
            const cropTasks = predictionEngine.generateTasks(p, weather);
            tasks.push(...cropTasks);
        }

        if (tasks.length === 0) {
            tasks.push({
                parcelle: 'Général',
                task: 'Aucune tâche urgente. Profitez-en pour planifier la saison prochaine.',
                priority: 'low',
                icon: '📝',
                id: 'task-no-action',
                personnel: false
            });
        }

        // Sort by priority (urgent > high > medium > low)
        const priorityOrder = { 'urgent': 0, 'high': 1, 'medium': 2, 'low': 3 };
        return tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    } catch (error) {
        console.error("Error generating tasks:", error);
        return [{
            parcelle: 'Système',
            task: 'Impossible de générer les tâches (Erreur DB)',
            priority: 'high',
            icon: '⚠️',
            id: 'error-db',
            personnel: false
        }];
    }
}

export async function syncGroundedAlerts(userId = 1) {
    try {
        const [parcels] = await pool.query('SELECT * FROM parcelle WHERE id_utilisateur = $1', [userId]);
        const weather = await getWeatherAdvice();

        for (const p of parcels?.rows || []) {
            // Check for critical weather risks
            if (weather.desc.includes('Pluie') || weather.desc.includes('Orage')) {
                await triggerAlertIfNotExists(
                    userId,
                    `Risque Météo - ${p.nom_parcelle}`,
                    `Fortes pluies prévues. Surveillez le drainage.`,
                    'meteo',
                    'high'
                );
            }
        }
    } catch (error) {
        console.error('Error in syncGroundedAlerts:', error);
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
