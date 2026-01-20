import pg from 'pg';
import { logger } from './logger';

// Check if we're in build mode (no database available)
const isBuildMode = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

// Mock pool for build mode
const mockPool = {
    query: async (text, params) => {
        if (text.includes('SELECT COUNT(*)')) {
            return { rows: [{ count: 0 }] };
        }
        return { rows: [] };
    },
    on: () => { } // Mock event listener
};

let pool;

if (isBuildMode) {
    pool = mockPool;
} else {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ WARNING: DATABASE_URL environment variable is not set. Database features will fail.');
    }

    pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 10000, // Reduced for serverless
        idleTimeoutMillis: 10000,       // Reduced for serverless
        max: 10                         // Limit pool size for serverless
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        // Don't exit process in serverless environment usually, but log critical error
    });
}

export default pool;
