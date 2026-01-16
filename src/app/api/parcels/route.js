import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 1;

        const [rows] = await pool.query(`
            SELECT p.*, c.nom_culture, c.couleur, c.cycle_vie_jours 
            FROM parcelle p 
            JOIN culture c ON p.id_culture = c.id_culture 
            WHERE p.id_utilisateur = ? 
            ORDER BY p.date_semis DESC
        `, [userId]);

        return NextResponse.json({ parcels: rows });
    } catch (error) {
        console.error('GET /api/parcels error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_parcelle, userId } = await request.json();

        if (!id_parcelle || !userId) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Verify ownership before deletion
        const [check] = await pool.query(
            'SELECT id_parcelle FROM parcelle WHERE id_parcelle = ? AND id_utilisateur = ?',
            [id_parcelle, userId]
        );

        if (check.length === 0) {
            return NextResponse.json({ error: 'Parcelle non trouvée ou non autorisée' }, { status: 404 });
        }

        await pool.query('DELETE FROM parcelle WHERE id_parcelle = ?', [id_parcelle]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/parcels error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
