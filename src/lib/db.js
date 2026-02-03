import pg from 'pg';
import { logger } from './logger';

// Check if we're in build mode (no database available)
const isBuildMode = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

// Mock pool for build mode
const mockPool = {
    query: async (text, params) => {
        console.log('📝 Mock DB Query:', text.substring(0, 50) + '...', params);
        if (text.includes('SELECT COUNT(*)')) {
            return { rows: [{ count: 0 }] };
        }
        if (text.includes('INSERT')) {
            // Return a fake ID for inserts
            return { rows: [{ id: 1, id_parcelle: 1, id_alerte: 1 }], rowCount: 1 };
        }
        if (text.includes('DELETE') || text.includes('UPDATE')) {
            return { rows: [], rowCount: 1 };
        }
        // Default select
        return { rows: [] };
    },
    on: () => { } // Mock event listener
};

let pool;

if (isBuildMode) {
    console.log('🏗️ Build mode detected: Using Mock DB.');
    pool = mockPool;
} else {
    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl || databaseUrl.includes('placeholder')) {
        console.warn('⚠️ WARNING: DATABASE_URL not set or placeholder. Using Persistent Local JSON DB.');
        const localDb = require('./localDb').default;
        pool = {
            query: async (text, params) => {
                try {
                    return await localDb.query(text, params);
                } catch (err) {
                    console.error('❌ LocalDB Query Error:', err);
                    return { rows: [], rowCount: 0 };
                }
            },
            on: () => { }
        };
    } else {
        try {
            const url = new URL(databaseUrl);
            const poolConfig = {
                user: url.username,
                password: url.password,
                host: url.hostname,
                port: parseInt(url.port || '5432'),
                database: url.pathname.slice(1),
                ssl: { rejectUnauthorized: false },
                connectionTimeoutMillis: 5000, // Shorter timeout for faster fallback
                idleTimeoutMillis: 10000,
                max: 10,
                family: 4
            };

            const realPool = new pg.Pool(poolConfig);

            // Wrap the query method to catch connection errors and fallback
            pool = {
                query: async (text, params) => {
                    try {
                        return await realPool.query(text, params);
                    } catch (err) {
                        if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED' || err.message.includes('timeout')) {
                            console.error(`🔌 Database Connection Error (${err.code}): Falling back to Local JSON DB during this request.`);
                            const localDb = require('./localDb').default;
                            return await localDb.query(text, params);
                        }
                        throw err;
                    }
                },
                on: (event, handler) => realPool.on(event, handler),
                end: () => realPool.end()
            };

            realPool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
            });
        } catch (e) {
            console.error('Failed to initialize PG pool, falling back to Local JSON DB', e);
            const localDb = require('./localDb').default;
            pool = {
                query: async (text, params) => await localDb.query(text, params),
                on: () => { }
            };
        }
    }
}
export default pool;
