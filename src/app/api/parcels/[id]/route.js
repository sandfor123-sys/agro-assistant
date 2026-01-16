import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 1;

        const result = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p
            JOIN culture c ON p.id_culture = c.id_culture
            WHERE p.id_parcelle = $1 AND p.id_utilisateur = $2
        `, [id, userId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Parcelle non trouvée' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('GET /api/parcels/[id] error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const { nom_parcelle, superficie, date_semis, statut, userId = 1 } = await request.json();

        if (!nom_parcelle || !superficie || !date_semis || !statut) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Verify ownership before update
        const check = await pool.query(
            'SELECT id_parcelle FROM parcelle WHERE id_parcelle = $1 AND id_utilisateur = $2',
            [id, userId]
        );

        if (check.rows.length === 0) {
            return NextResponse.json({ error: 'Parcelle non trouvée ou non autorisée' }, { status: 404 });
        }

        await pool.query(`
            UPDATE parcelle 
            SET nom_parcelle = $1, superficie = $2, date_semis = $3, statut = $4
            WHERE id_parcelle = $5 AND id_utilisateur = $6
        `, [nom_parcelle, superficie, date_semis, statut, id, userId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PUT /api/parcels/[id] error:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de la parcelle' }, { status: 500 });
    }
}
