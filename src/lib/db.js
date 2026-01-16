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

// Create PostgreSQL connection pool
const pool = isBuildMode ? mockPool : new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
