import pool from './db';
import { getWeeklyTasks, getWeatherAdvice, getImmediateAction, getFinancialTip, getGreeting, syncGroundedAlerts } from './dailyAssistant';

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

        const greeting = getGreeting();

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
        // Fallback data instead of throwing to prevent build crash
        return {
            user: { prenom: 'Jean', nom: 'Kouassi' },
            greeting: 'Bonjour',
            stats: { parcelles: 0, alertes: 0, revenus: '0', successRate: '100%' },
            weather: { icon: '☀️', temp: '30°C', desc: 'Beau temps', advice: 'Bonne journée' },
            action: { icon: '📊', message: 'Bienvenue sur AgriAssist', link: '#' },
            financialTip: 'Conseil en cours de chargement...',
            weeklyTasks: [],
            recentParcelles: []
        };
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
