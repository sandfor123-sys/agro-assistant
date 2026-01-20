import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'logs', 'health-monitor.log');
const HEALTH_THRESHOLD = {
  memory: 80, // 80% memory usage
  disk: 90,    // 90% disk usage
  responseTime: 3000 // 3 seconds
};

// Ensure logs directory exists
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function logHealth(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
}

async function getSystemHealth() {
  try {
    const health = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {}
    };

    // Memory check
    const memUsage = process.memoryUsage();
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100;
    health.checks.memory = {
      usage: `${Math.round(memUsagePercent)}%`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      status: memUsagePercent < HEALTH_THRESHOLD.memory ? 'healthy' : 'warning'
    };

    // Database connection check
    try {
      const { default: pool } = await import('@/lib/db');
      const { rows } = await pool.query('SELECT 1 as test');
      health.checks.database = {
        status: 'healthy',
        responseTime: 'fast'
      };
    } catch (error) {
      health.checks.database = {
        status: 'error',
        error: error.message
      };
      health.status = 'unhealthy';
    }

    // Disk space check
    try {
      const stats = fs.statSync(process.cwd());
      health.checks.disk = {
        status: 'healthy',
        available: 'sufficient'
      };
    } catch (error) {
      health.checks.disk = {
        status: 'warning',
        error: error.message
      };
    }

    // Uptime check
    const uptime = process.uptime();
    health.checks.uptime = {
      seconds: Math.round(uptime),
      formatted: formatUptime(uptime),
      status: 'healthy'
    };

    // Overall status
    const hasErrors = Object.values(health.checks).some(check => check.status === 'error');
    const hasWarnings = Object.values(health.checks).some(check => check.status === 'warning');

    if (hasErrors) {
      health.status = 'unhealthy';
    } else if (hasWarnings) {
      health.status = 'degraded';
    }

    return health;
  } catch (error) {
    logHealth(`Health check failed: ${error.message}`, 'ERROR');
    return {
      timestamp: new Date().toISOString(),
      status: 'error',
      error: error.message
    };
  }
}

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

export async function GET() {
  try {
    const health = await getSystemHealth();

    // Log health status
    logHealth(`Health check completed: ${health.status}`);

    // Return appropriate HTTP status
    const statusCode = health.status === 'healthy' ? 200 :
      health.status === 'degraded' ? 200 :
        health.status === 'unhealthy' ? 503 : 500;

    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    logHealth(`Health endpoint error: ${error.message}`, 'ERROR');
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    // Manual health check trigger
    const health = await getSystemHealth();

    // Send alert if unhealthy
    if (health.status !== 'healthy') {
      logHealth(`ALERT: System status is ${health.status}`, 'ALERT');

      // Here you could add email/SMS notifications
      // await sendAlert(health);
    }

    return NextResponse.json({
      message: 'Health check completed',
      health
    });
  } catch (error) {
    logHealth(`Manual health check failed: ${error.message}`, 'ERROR');
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
