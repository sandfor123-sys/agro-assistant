import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { id_alerte, userId } = await request.json();

        if (!id_alerte || !userId) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        await pool.query(
            'UPDATE alerte SET lu = 1 WHERE id_alerte = ? AND id_utilisateur = ?',
            [id_alerte, userId]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('POST /api/alerts/read error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
