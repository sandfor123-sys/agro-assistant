import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import fs from 'fs';
import path from 'path';

// Automatic maintenance tasks
class MaintenanceScheduler {
  constructor() {
    this.lastBackup = null;
    this.lastCleanup = null;
    this.lastHealthCheck = null;
    this.maintenanceLog = path.join(process.cwd(), 'logs', 'maintenance.log');

    // Ensure logs directory exists
    if (!fs.existsSync(path.dirname(this.maintenanceLog))) {
      fs.mkdirSync(path.dirname(this.maintenanceLog), { recursive: true });
    }
  }

  log(message, level = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level}] ${message}\n`;
    fs.appendFileSync(this.maintenanceLog, logEntry);
    logger.info(`Maintenance: ${message}`, { level });
  }

  async performBackup() {
    try {
      this.log('Starting automatic backup');

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'database' })
      });

      if (response.ok) {
        this.log('Automatic backup completed successfully');
        this.lastBackup = new Date();
        return true;
      } else {
        throw new Error('Backup request failed');
      }
    } catch (error) {
      this.log(`Automatic backup failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async performCleanup() {
    try {
      this.log('Starting automatic cleanup');

      // Clear old logs
      logger.clearOldLogs(7);

      // Clear old cache entries
      const cacheResponse = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/cache`, {
        method: 'DELETE'
      });

      if (cacheResponse.ok) {
        this.log('Automatic cleanup completed successfully');
        this.lastCleanup = new Date();
        return true;
      } else {
        throw new Error('Cache cleanup failed');
      }
    } catch (error) {
      this.log(`Automatic cleanup failed: ${error.message}`, 'ERROR');
      return false;
    }
  }

  async performHealthCheck() {
    try {
      this.log('Starting automatic health check');

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/api/health`);

      if (response.ok) {
        const health = await response.json();
        this.log(`Health check completed: ${health.status}`);
        this.lastHealthCheck = new Date();

        // Log if unhealthy
        if (health.status !== 'healthy') {
          this.log(`System health degraded: ${health.status}`, 'WARN');
        }

        return health;
      } else {
        throw new Error('Health check request failed');
      }
    } catch (error) {
      this.log(`Automatic health check failed: ${error.message}`, 'ERROR');
      return null;
    }
  }

  async runScheduledTasks() {
    const now = new Date();

    // Check if it's time for daily backup (2 AM)
    if (now.getHours() === 2 && now.getMinutes() === 0) {
      await this.performBackup();
    }

    // Check if it's time for weekly cleanup (Sunday 3 AM)
    if (now.getDay() === 0 && now.getHours() === 3 && now.getMinutes() === 0) {
      await this.performCleanup();
    }

    // Check if it's time for hourly health check
    if (now.getMinutes() === 0) {
      await this.performHealthCheck();
    }
  }

  getStatus() {
    return {
      lastBackup: this.lastBackup,
      lastCleanup: this.lastCleanup,
      lastHealthCheck: this.lastHealthCheck,
      nextBackup: this.getNextBackupTime(),
      nextCleanup: this.getNextCleanupTime(),
      nextHealthCheck: this.getNextHealthCheckTime()
    };
  }

  getNextBackupTime() {
    const now = new Date();
    const nextBackup = new Date(now);
    nextBackup.setHours(2, 0, 0, 0);
    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }
    return nextBackup;
  }

  getNextCleanupTime() {
    const now = new Date();
    const nextCleanup = new Date(now);
    nextCleanup.setDate(now.getDate() + (7 - now.getDay()) % 7);
    nextCleanup.setHours(3, 0, 0, 0);
    return nextCleanup;
  }

  getNextHealthCheckTime() {
    const now = new Date();
    const nextHealthCheck = new Date(now);
    nextHealthCheck.setHours(now.getHours(), 60, 0, 0);
    if (nextHealthCheck <= now) {
      nextHealthCheck.setHours(nextHealthCheck.getHours() + 1);
    }
    return nextHealthCheck;
  }
}

const scheduler = new MaintenanceScheduler();

// Start the scheduler only in non-build/production environments where appropriate
const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || process.env.VERCEL === '1' || process.env.CI === '1';

if (typeof window === 'undefined' && !isBuild && process.env.NODE_ENV !== 'test') {
  // Run every minute
  const interval = setInterval(() => {
    scheduler.runScheduledTasks();
  }, 60000);

  // Clean up interval if needed (though this is a long-running process)
  if (process.env.NODE_ENV === 'development') {
    // Prevent multiple intervals in dev HMR
    global._maintenanceInterval = interval;
  }

  // Run initial health check
  scheduler.performHealthCheck();
}

export async function GET() {
  try {
    const status = scheduler.getStatus();

    return NextResponse.json({
      status: 'success',
      maintenance: status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to get maintenance status', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { task } = await new Request().json();

    let result;
    switch (task) {
      case 'backup':
        result = await scheduler.performBackup();
        break;
      case 'cleanup':
        result = await scheduler.performCleanup();
        break;
      case 'health':
        result = await scheduler.performHealthCheck();
        break;
      default:
        return NextResponse.json({ error: 'Invalid task' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      task,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logger.error('Failed to execute maintenance task', { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
