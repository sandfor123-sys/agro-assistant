import pg from 'pg';

let internalPool = null;
let useLocalDbFallback = false;

// Determine if we should start in local mode
const shouldStartLocal =
    process.env.NEXT_PHASE === 'phase-production-build' ||
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.includes('placeholder') ||
    process.env.VERCEL === '1'; // Default to local on Vercel unless DB is confirmed working

if (shouldStartLocal) {
    console.log('🏗️ Environment (Build/Vercel) detected: Defaulting to Local JSON DB for stability.');
    useLocalDbFallback = true;
}

const pool = {
    query: async (text, params) => {
        if (useLocalDbFallback) {
            try {
                const localDb = require('./localDb').default;
                return await localDb.query(text, params);
            } catch (err) {
                console.error('❌ LocalDB Fallback Query Error:', err);
                return { rows: [], rowCount: 0 };
            }
        }

        if (!internalPool) {
            try {
                const url = new URL(process.env.DATABASE_URL);
                internalPool = new pg.Pool({
                    connectionString: process.env.DATABASE_URL,
                    ssl: { rejectUnauthorized: false },
                    connectionTimeoutMillis: 3000,
                    idleTimeoutMillis: 10000,
                    max: 10,
                    family: 4
                });
                internalPool.on('error', (err) => {
                    console.error('🔌 Unexpected error on idle client:', err.message);
                    if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
                        useLocalDbFallback = true;
                    }
                });
            } catch (e) {
                console.error('❌ Failed to initialize PG pool:', e.message);
                useLocalDbFallback = true;
                const localDb = require('./localDb').default;
                return await localDb.query(text, params);
            }
        }

        try {
            return await internalPool.query(text, params);
        } catch (err) {
            const isConnError = err.code === 'ENOTFOUND' ||
                err.code === 'ECONNREFUSED' ||
                err.message.includes('getaddrinfo') ||
                err.message.includes('timeout');

            if (isConnError) {
                console.error(`🔌 DB Connection Error (${err.code || 'TIMEOUT'}): Switching to Local JSON DB permanently for this session.`);
                useLocalDbFallback = true;
                const localDb = require('./localDb').default;
                return await localDb.query(text, params);
            }
            throw err;
        }
    },
    on: (event, handler) => {
        if (internalPool) internalPool.on(event, handler);
    },
    end: async () => {
        if (internalPool) await internalPool.end();
    }
};

export default pool;
