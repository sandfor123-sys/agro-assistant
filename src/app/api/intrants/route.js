import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId') || 1);

        const [rows] = await pool.query(
            `
            SELECT 
                s.id_stock,
                s.quantite_actuelle,
                s.quantite_theorique,
                s.date_derniere_maj,
                s.id_utilisateur,
                i.id_intrant,
                i.nom_intrant,
                i.type,
                i.unite_mesure
            FROM stock s
            JOIN intrant i ON s.id_intrant = i.id_intrant
            WHERE s.id_utilisateur = ?
            ORDER BY i.nom_intrant ASC
        `,
            [userId]
        );

        return NextResponse.json({ intrants: rows });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch intrants' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const userId = Number(body.userId || 1);

        const nom_intrant = typeof body.nom_intrant === 'string' ? body.nom_intrant.trim() : '';
        const type = typeof body.type === 'string' ? body.type.trim() : null;
        const unite_mesure = typeof body.unite_mesure === 'string' ? body.unite_mesure.trim() : null;
        const quantite_actuelle = body.quantite_actuelle === '' || body.quantite_actuelle == null ? null : Number(body.quantite_actuelle);

        if (!nom_intrant) {
            return NextResponse.json({ error: 'nom_intrant is required' }, { status: 400 });
        }

        const [intrantInsert] = await pool.query(
            'INSERT INTO intrant (nom_intrant, type, unite_mesure) VALUES (?, ?, ?)',
            [nom_intrant, type, unite_mesure]
        );

        const id_intrant = intrantInsert.insertId;
        const today = new Date();
        const date_derniere_maj = today.toISOString().slice(0, 10);

        await pool.query(
            'INSERT INTO stock (id_intrant, quantite_actuelle, date_derniere_maj, id_utilisateur) VALUES (?, ?, ?, ?)',
            [id_intrant, Number.isFinite(quantite_actuelle) ? quantite_actuelle : null, date_derniere_maj, userId]
        );

        return NextResponse.json({ ok: true, id_intrant });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create intrant' }, { status: 500 });
    }
}
