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
    pool = mockPool;
} else {
    if (!process.env.DATABASE_URL) {
        console.warn('⚠️ WARNING: DATABASE_URL not set. Using Persistent Local JSON DB.');
        // Require strictly inside this block to avoid loading fs/path in Edge Runtime if used later
        const localDb = require('./localDb').default;

        pool = {
            query: async (text, params) => {
                return await localDb.query(text, params);
            },
            on: () => { }
        };
    } else {
        // Parse the connection string manually to ensure options like 'family' are respected
        // improperly by some pg versions when using connectionString directly.
        try {
            const url = new URL(process.env.DATABASE_URL);

            pool = new pg.Pool({
                user: url.username,
                password: url.password,
                host: url.hostname,
                port: parseInt(url.port || '5432'),
                database: url.pathname.slice(1), // remove leading slash
                ssl: {
                    rejectUnauthorized: false
                },
                connectionTimeoutMillis: 10000,
                idleTimeoutMillis: 10000,
                max: 10,
                family: 4 // Strictly force IPv4
            });

            pool.on('error', (err) => {
                console.error('Unexpected error on idle client', err);
            });
        } catch (e) {
            console.error('Failed to parse DATABASE_URL, falling back to connectionString', e);
            pool = new pg.Pool({
                connectionString: process.env.DATABASE_URL,
                ssl: { rejectUnauthorized: false },
                family: 4
            });
        }
    }
}
export default pool;
