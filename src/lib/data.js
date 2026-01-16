import pool from './db';
import {
    getGreeting,
    getWeatherAdvice,
    getImmediateAction,
    getWeeklyTasks,
    getFinancialTip,
    syncGroundedAlerts
} from './dailyAssistant';

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
            pool.query('SELECT COUNT(*) as count FROM parcelle WHERE id_utilisateur = ?', [userId]),
            pool.query('SELECT COUNT(*) as count FROM alerte WHERE id_utilisateur = ? AND lu = 0', [userId]),
            pool.query(`
        SELECT p.*, c.nom_culture, c.couleur 
        FROM parcelle p 
        JOIN culture c ON p.id_culture = c.id_culture 
        WHERE p.id_utilisateur = ? 
        ORDER BY p.date_semis DESC 
        LIMIT 4
      `, [userId]),
            getWeatherAdvice(),
            getImmediateAction(),
            getFinancialTip(),
            getWeeklyTasks(userId)
        ]);

        const stats = {
            parcelles: nbParcellesResult[0][0].count,
            alertes: nbAlertesResult[0][0].count,
            revenus: '2.5M', // Hardcoded as per PHP original
            successRate: '85%' // Hardcoded as per PHP original
        };

        let user = { prenom: 'Jean', nom: 'Kouassi' };

        try {
            const [userResult] = await pool.query('SELECT prenom, nom FROM utilisateur WHERE id_utilisateur = ?', [userId]);
            if (userResult.length > 0) {
                user = userResult[0];
            }
        } catch (e) {
            console.warn("User fetch failed, utilizing fallback");
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
            recentParcelles: recentParcelles[0]
        };

    } catch (error) {
        console.error('getDashboardData Error:', error);
        throw new Error('Failed to fetch dashboard data');
    }
}
export async function getAlerts(userId = 1) {
    try {
        const [rows] = await pool.query(`
            SELECT a.* 
            FROM alerte a
            WHERE a.id_utilisateur = ?
            ORDER BY a.date_creation DESC
        `, [userId]);
        return rows;
    } catch (error) {
        console.error('getAlerts Error:', error);
        return [];
    }
}

export async function getTrackingData(userId = 1) {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p
            JOIN culture c ON p.id_culture = c.id_culture
            WHERE p.id_utilisateur = ?
            ORDER BY p.date_semis DESC
        `, [userId]);
        return rows;
    } catch (error) {
        console.error('getTrackingData Error:', error);
        throw new Error('Failed to fetch tracking data');
    }
}
