import mysql from 'mysql2/promise';

// Check if we're in build mode (no database available)
const isBuildMode = process.env.NODE_ENV === 'production' && !process.env.DB_HOST;

// Mock pool for build mode
const mockPool = {
    query: async (sql, params) => {
        console.log('Mock query (build mode):', sql, params);
        // Return empty results for all queries during build
        if (sql.includes('SELECT COUNT(*)')) {
            return [[{ count: 0 }]];
        }
        if (sql.includes('SELECT')) {
            return [[]];
        }
        return [[]];
    }
};

// Create the connection pool. The pool-specific settings are the defaults
const pool = isBuildMode ? mockPool : mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'agriculture_platform',
    waitForConnections: true,
    connectionLimit: 10,
    maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
    idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
});

export default pool;
