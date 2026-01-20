import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId') || 1);

        // Get parcelles avec leurs informations de suivi
        const { rows } = await pool.query(`
            SELECT 
                p.id_parcelle,
                p.nom_parcelle,
                p.superficie,
                p.date_semis,
                p.statut,
                c.nom_culture,
                c.cycle_vie_jours
            FROM parcelle p
            LEFT JOIN culture c ON p.id_culture = c.id_culture
            WHERE p.id_utilisateur = $1
            ORDER BY p.date_semis DESC
        `, [userId]);

        return NextResponse.json({
            success: true,
            data: rows
        });
    } catch (error) {
        console.error('Tracking API error:', error);
        return NextResponse.json({
            success: false,
            error: 'Erreur lors de la récupération des données de suivi'
        }, { status: 500 });
    }
}
