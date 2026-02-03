import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('id') || 1;

        const result = await pool.query('SELECT * FROM utilisateur WHERE id_utilisateur = $1', [userId]);

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0]);
    } catch (error) {
        console.error('User GET Error:', error);
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        const { id_utilisateur, nom, prenom, email, role, phone, location } = body;

        if (!id_utilisateur) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        // We use a simplified update query that works with our LocalDB handleUpdate logic
        // or a real PG database.
        await pool.query(
            'UPDATE utilisateur SET nom = $1, prenom = $2, email = $3, role = $4 WHERE id_utilisateur = $5',
            [nom, prenom, email, role, id_utilisateur]
        );

        return NextResponse.json({ message: 'User updated successfully' });
    } catch (error) {
        console.error('User POST Error:', error);
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
