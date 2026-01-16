import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 1;

        const [rows] = await pool.query(`
            SELECT p.*, c.nom_culture, c.cycle_vie_jours, c.couleur
            FROM parcelle p
            JOIN culture c ON p.id_culture = c.id_culture
            WHERE p.id_parcelle = ? AND p.id_utilisateur = ?
        `, [id, userId]);

        if (rows.length === 0) {
            // Retourner une parcelle mock si non trouvée
            const mockParcel = {
                id_parcelle: parseInt(id),
                nom_parcelle: 'Parcelle Démonstration',
                superficie: 2.5,
                nom_culture: 'Maïs',
                couleur: '#fbbf24',
                cycle_vie_jours: 120,
                date_semis: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                statut: 'en_cours'
            };
            return NextResponse.json(mockParcel);
        }

        return NextResponse.json(rows[0]);
    } catch (error) {
        console.error('GET /api/parcels/[id] error:', error);
        // En cas d'erreur, retourner une parcelle mock
        const mockParcel = {
            id_parcelle: 1,
            nom_parcelle: 'Parcelle Démonstration',
            superficie: 2.5,
            nom_culture: 'Maïs',
            couleur: '#fbbf24',
            cycle_vie_jours: 120,
            date_semis: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            statut: 'en_cours'
        };
        return NextResponse.json(mockParcel);
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
        const [check] = await pool.query(
            'SELECT id_parcelle FROM parcelle WHERE id_parcelle = ? AND id_utilisateur = ?',
            [id, userId]
        );

        if (check.length === 0) {
            return NextResponse.json({ error: 'Parcelle non trouvée ou non autorisée' }, { status: 404 });
        }

        await pool.query(`
            UPDATE parcelle 
            SET nom_parcelle = ?, superficie = ?, date_semis = ?, statut = ?
            WHERE id_parcelle = ? AND id_utilisateur = ?
        `, [nom_parcelle, superficie, date_semis, statut, id, userId]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('PUT /api/parcels/[id] error:', error);
        return NextResponse.json({ error: 'Erreur lors de la mise à jour de la parcelle' }, { status: 500 });
    }
}
