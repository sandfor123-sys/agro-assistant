import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = Number(searchParams.get('userId') || 1);

        // Check if id_parcelle column exists
        const [columns] = await pool.query("SHOW COLUMNS FROM alerte LIKE 'id_parcelle'");
        const hasParcelleColumn = columns.length > 0;

        let query, rows;
        if (hasParcelleColumn) {
            query = `SELECT a.*, p.nom_parcelle 
                FROM alerte a 
                LEFT JOIN parcelle p ON a.id_parcelle = p.id_parcelle 
                WHERE a.id_utilisateur = ? 
                ORDER BY a.date_creation DESC`;
            [rows] = await pool.query(query, [userId]);
        } else {
            query = `SELECT *, NULL as nom_parcelle
                FROM alerte 
                WHERE a.id_utilisateur = ? 
                ORDER BY a.date_creation DESC`;
            [rows] = await pool.query(query, [userId]);
        }

        return NextResponse.json({ alerts: rows });
    } catch (error) {
        console.error('GET /api/alerts error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { titre, message, type, priorite, id_parcelle, userId } = await request.json();

        if (!titre || !message || !type || !priorite || !userId) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Check if id_parcelle column exists
        const [columns] = await pool.query("SHOW COLUMNS FROM alerte LIKE 'id_parcelle'");
        const hasParcelleColumn = columns.length > 0;

        let query, values;
        if (hasParcelleColumn && id_parcelle) {
            query = 'INSERT INTO alerte (titre, message, type, priorite, lu, id_utilisateur, id_parcelle, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
            values = [titre, message, String(type).slice(0, 50), priorite, 0, userId, id_parcelle, new Date()];
        } else {
            query = 'INSERT INTO alerte (titre, message, type, priorite, lu, id_utilisateur, date_creation) VALUES (?, ?, ?, ?, ?, ?, ?)';
            values = [titre, message, String(type).slice(0, 50), priorite, 0, userId, new Date()];
        }

        await pool.query(query, values);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('POST /api/alerts error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
