import pg from 'pg';

// Check if we're in build mode (no database available)
const isBuildMode = process.env.NODE_ENV === 'production' && !process.env.DATABASE_URL;

// Mock pool for build mode
const mockPool = {
    query: async (text, params) => {
        console.log('Mock query (build mode):', text, params);
        // Return empty results for all queries during build
        if (text.includes('SELECT COUNT(*)')) {
            return [{ rows: [{ count: 0 }] }];
        }
        if (text.includes('SELECT')) {
            return { rows: [] };
        }
        return { rows: [] };
    }
};

// Create PostgreSQL connection pool with direct parameters
const pool = isBuildMode ? mockPool : new pg.Pool({
    host: 'db.jwyddxuemrnmaxhjnhgc.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: 'AgriAssist2026',
    ssl: {
        rejectUnauthorized: false
    },
    // Forcer IPv4 si possible
    family: 4,
    // Timeout settings
    connectionTimeoutMillis: 15000,
    idleTimeoutMillis: 30000,
    // Configuration supplémentaire
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
});

export default pool;
