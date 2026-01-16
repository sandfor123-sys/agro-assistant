import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function PATCH(request) {
    try {
        const body = await request.json();
        const userId = Number(body.userId || 1);

        const id_stock = body.id_stock == null ? null : Number(body.id_stock);
        const id_intrant = body.id_intrant == null ? null : Number(body.id_intrant);

        const mode = body.mode === 'set' ? 'set' : 'adjust';

        const today = new Date();
        const date_derniere_maj = today.toISOString().slice(0, 10);

        if (!Number.isFinite(userId)) {
            return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
        }

        if (!Number.isFinite(id_stock) && !Number.isFinite(id_intrant)) {
            return NextResponse.json({ error: 'id_stock or id_intrant is required' }, { status: 400 });
        }

        if (mode === 'set') {
            const quantite_actuelle = Number(body.quantite_actuelle);
            if (!Number.isFinite(quantite_actuelle) || quantite_actuelle < 0) {
                return NextResponse.json({ error: 'Invalid quantite_actuelle' }, { status: 400 });
            }

            const whereClause = Number.isFinite(id_stock)
                ? 'id_stock = ? AND id_utilisateur = ?'
                : 'id_intrant = ? AND id_utilisateur = ?';
            const whereArgs = Number.isFinite(id_stock) ? [id_stock, userId] : [id_intrant, userId];

            const [result] = await pool.query(
                `UPDATE stock SET quantite_actuelle = ?, date_derniere_maj = ? WHERE ${whereClause}`,
                [quantite_actuelle, date_derniere_maj, ...whereArgs]
            );

            if (result.affectedRows === 0) {
                return NextResponse.json({ error: 'Stock row not found' }, { status: 404 });
            }

            return NextResponse.json({ ok: true });
        }

        const delta = Number(body.delta);
        if (!Number.isFinite(delta) || delta === 0) {
            return NextResponse.json({ error: 'Invalid delta' }, { status: 400 });
        }

        const whereClause = Number.isFinite(id_stock)
            ? 'id_stock = ? AND id_utilisateur = ?'
            : 'id_intrant = ? AND id_utilisateur = ?';
        const whereArgs = Number.isFinite(id_stock) ? [id_stock, userId] : [id_intrant, userId];

        const [result] = await pool.query(
            `UPDATE stock 
             SET quantite_actuelle = GREATEST(0, COALESCE(quantite_actuelle, 0) + ?), date_derniere_maj = ?
             WHERE ${whereClause}`,
            [delta, date_derniere_maj, ...whereArgs]
        );

        if (result.affectedRows === 0) {
            return NextResponse.json({ error: 'Stock row not found' }, { status: 404 });
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update stock' }, { status: 500 });
    }
}
