import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Test simple connection
        const result = await pool.query('SELECT 1 as test');
        
        return NextResponse.json({ 
            success: true, 
            message: 'Database connection successful',
            result: result.rows[0],
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            env: {
                hasDatabaseUrl: !!process.env.DATABASE_URL,
                nodeEnv: process.env.NODE_ENV
            }
        }, { status: 500 });
    }
}
