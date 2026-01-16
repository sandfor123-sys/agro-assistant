import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        // Test simple connection
        const [rows] = await pool.query('SELECT 1 as test');
        
        return NextResponse.json({ 
            success: true, 
            message: 'Database connection successful',
            result: rows[0],
            env: {
                hasDbHost: !!process.env.DB_HOST,
                hasDbUser: !!process.env.DB_USER,
                hasDbPassword: !!process.env.DB_PASSWORD,
                hasDbName: !!process.env.DB_NAME,
                nodeEnv: process.env.NODE_ENV
            }
        });
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            error: error.message,
            env: {
                hasDbHost: !!process.env.DB_HOST,
                hasDbUser: !!process.env.DB_USER,
                hasDbPassword: !!process.env.DB_PASSWORD,
                hasDbName: !!process.env.DB_NAME,
                nodeEnv: process.env.NODE_ENV
            }
        }, { status: 500 });
    }
}
