import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId') || 1;

        const result = await pool.query(`
            SELECT p.*, c.nom_culture, c.couleur, c.cycle_vie_jours 
            FROM parcelle p 
            JOIN culture c ON p.id_culture = c.id_culture 
            WHERE p.id_utilisateur = $1 
            ORDER BY p.date_semis DESC
        `, [userId]);

        return NextResponse.json({ parcels: result.rows });
    } catch (error) {
        console.error('GET /api/parcels error:', error);
        // En cas d'erreur de BDD, retourner un tableau vide plutot que des faux
        return NextResponse.json({ parcels: [] });
    }
}

export async function POST(request) {
    try {
        const { nom_parcelle, superficie, id_culture, date_semis, statut, userId = 1 } = await request.json();

        // Logging pour diagnostic
        console.log('POST /api/parcels - Request data:', {
            nom_parcelle,
            superficie,
            id_culture,
            date_semis,
            statut,
            userId
        });

        if (!nom_parcelle || !superficie || !id_culture || !date_semis) {
            return NextResponse.json({
                error: 'Champs requis manquants: nom_parcelle, superficie, id_culture, date_semis',
                received: { nom_parcelle, superficie, id_culture, date_semis }
            }, { status: 400 });
        }

        // Validation des données
        if (isNaN(Number(superficie)) || Number(superficie) <= 0) {
            return NextResponse.json({ error: 'La superficie doit être un nombre positif' }, { status: 400 });
        }

        if (isNaN(Number(id_culture)) || Number(id_culture) <= 0) {
            return NextResponse.json({ error: 'L\'ID de culture doit être un nombre positif' }, { status: 400 });
        }

        // S'assurer que le statut est valide et pas trop long
        const validStatus = statut || 'en_cours';
        const finalStatus = validStatus.length > 20 ? validStatus.substring(0, 20) : validStatus;

        console.log('POST /api/parcels - Attempting database insert...');

        const result = await pool.query(`
            INSERT INTO parcelle (nom_parcelle, superficie, id_culture, date_semis, statut, id_utilisateur)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id_parcelle
        `, [nom_parcelle, Number(superficie), Number(id_culture), date_semis, finalStatus, userId]);

        console.log('POST /api/parcels - Success:', result);
        console.log('POST /api/parcels - Rows:', result.rows);
        console.log('POST /api/parcels - First row:', result.rows[0]);

        if (!result.rows || result.rows.length === 0) {
            console.error('POST /api/parcels - No rows returned from INSERT');
            return NextResponse.json({
                error: 'Erreur lors de la création: aucune donnée retournée'
            }, { status: 500 });
        }

        const newId = result.rows[0].id_parcelle;
        if (!newId) {
            console.error('POST /api/parcels - No id_parcelle in returned row:', result.rows[0]);
            return NextResponse.json({
                error: 'Erreur lors de la création: ID non généré'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            id_parcelle: newId,
            message: 'Parcelle créée avec succès'
        }, { status: 201 });
    } catch (error) {
        console.error('POST /api/parcels error:', {
            message: error.message,
            code: error.code,
            errno: error.errno,
            sqlState: error.sqlState,
            sqlMessage: error.sqlMessage
        });

        return NextResponse.json({
            error: error.message || 'Erreur inconnue',
            details: {
                code: error.code,
                errno: error.errno,
                sqlState: error.sqlState
            }
        }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { id_parcelle, userId } = await request.json();

        if (!id_parcelle || !userId) {
            return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
        }

        // Verify ownership before deletion
        const check = await pool.query(
            'SELECT id_parcelle FROM parcelle WHERE id_parcelle = $1 AND id_utilisateur = $2',
            [id_parcelle, userId]
        );

        if (check.rows.length === 0) {
            return NextResponse.json({ error: 'Parcelle non trouvée ou non autorisée' }, { status: 404 });
        }

        await pool.query('DELETE FROM parcelle WHERE id_parcelle = $1', [id_parcelle]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('DELETE /api/parcels error:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
