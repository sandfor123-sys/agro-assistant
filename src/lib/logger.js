import fs from 'fs';
import path from 'path';

class Logger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'app.log');
    this.errorFile = path.join(this.logDir, 'error.log');
    this.performanceFile = path.join(this.logDir, 'performance.log');
    
    // Ensure logs directory exists
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? ` | ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] ${message}${metaString}\n`;
  }

  writeToFile(filePath, message) {
    try {
      fs.appendFileSync(filePath, message);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, meta = {}) {
    const formattedMessage = this.formatMessage('INFO', message, meta);
    console.log(`[INFO] ${message}`, meta);
    this.writeToFile(this.logFile, formattedMessage);
  }

  warn(message, meta = {}) {
    const formattedMessage = this.formatMessage('WARN', message, meta);
    console.warn(`[WARN] ${message}`, meta);
    this.writeToFile(this.logFile, formattedMessage);
  }

  error(message, meta = {}) {
    const formattedMessage = this.formatMessage('ERROR', message, meta);
    console.error(`[ERROR] ${message}`, meta);
    this.writeToFile(this.errorFile, formattedMessage);
    this.writeToFile(this.logFile, formattedMessage);
  }

  debug(message, meta = {}) {
    const formattedMessage = this.formatMessage('DEBUG', message, meta);
    console.debug(`[DEBUG] ${message}`, meta);
    this.writeToFile(this.logFile, formattedMessage);
  }

  performance(operation, duration, meta = {}) {
    const message = `Performance: ${operation} completed in ${duration}ms`;
    const performanceMeta = { operation, duration, ...meta };
    const formattedMessage = this.formatMessage('PERF', message, performanceMeta);
    console.log(`[PERF] ${message}`, performanceMeta);
    this.writeToFile(this.performanceFile, formattedMessage);
  }

  apiRequest(req, res, duration) {
    const message = `API ${req.method} ${req.url} - ${res.statusCode} in ${duration}ms`;
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString()
    };
    
    if (res.statusCode >= 400) {
      this.error(message, meta);
    } else {
      this.info(message, meta);
    }
  }

  databaseQuery(query, duration, error = null) {
    const message = `DB Query: ${query.substring(0, 100)}... - ${duration}ms`;
    const meta = { query: query.substring(0, 200), duration };
    
    if (error) {
      this.error(`DB Error: ${error.message}`, { ...meta, error: error.message });
    } else {
      this.debug(message, meta);
    }
  }

  userAction(userId, action, details = {}) {
    const message = `User Action: ${userId} - ${action}`;
    const meta = { userId, action, ...details, timestamp: new Date().toISOString() };
    this.info(message, meta);
  }

  security(event, details = {}) {
    const message = `Security Event: ${event}`;
    const meta = { event, ...details, timestamp: new Date().toISOString() };
    this.warn(message, meta);
  }

  // Log rotation
  rotateLogs() {
    try {
      const maxLogSize = 10 * 1024 * 1024; // 10MB
      const logFiles = [this.logFile, this.errorFile, this.performanceFile];
      
      logFiles.forEach(file => {
        if (fs.existsSync(file)) {
          const stats = fs.statSync(file);
          if (stats.size > maxLogSize) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const rotatedFile = file.replace('.log', `-${timestamp}.log`);
            fs.renameSync(file, rotatedFile);
            this.info(`Log rotated: ${rotatedFile}`);
          }
        }
      });
    } catch (error) {
      this.error('Log rotation failed', { error: error.message });
    }
  }

  // Get recent logs
  getRecentLogs(type = 'app', lines = 100) {
    try {
      const logFile = type === 'error' ? this.errorFile : 
                     type === 'performance' ? this.performanceFile : 
                     this.logFile;
      
      if (!fs.existsSync(logFile)) {
        return [];
      }
      
      const content = fs.readFileSync(logFile, 'utf8');
      const logLines = content.split('\n').filter(line => line.trim());
      
      return logLines.slice(-lines);
    } catch (error) {
      this.error('Failed to read logs', { error: error.message, type });
      return [];
    }
  }

  // Clear old logs
  clearOldLogs(daysToKeep = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const logFiles = fs.readdirSync(this.logDir);
      let deletedCount = 0;
      
      logFiles.forEach(file => {
        const filePath = path.join(this.logDir, file);
        const stats = fs.statSync(filePath);
        
        if (stats.birthtime < cutoffDate) {
          fs.unlinkSync(filePath);
          deletedCount++;
        }
      });
      
      this.info(`Cleared ${deletedCount} old log files`);
    } catch (error) {
      this.error('Failed to clear old logs', { error: error.message });
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Performance monitoring decorator
export function withPerformanceLogging(target, propertyName, descriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = async function(...args) {
    const start = Date.now();
    try {
      const result = await originalMethod.apply(this, args);
      const duration = Date.now() - start;
      logger.performance(`${target.constructor.name}.${propertyName}`, duration);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`${target.constructor.name}.${propertyName} failed`, { 
        duration, 
        error: error.message 
      });
      throw error;
    }
  };
  
  return descriptor;
}

// API request logging middleware
export function createApiLogger() {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.apiRequest(req, res, duration);
    });
    
    next();
  };
}

export default logger;
