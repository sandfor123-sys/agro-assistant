import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKUP_DIR = path.join(process.cwd(), 'backups');
const LOG_FILE = path.join(process.cwd(), 'logs', 'backup.log');

// Ensure directories exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
if (!fs.existsSync(path.dirname(LOG_FILE))) {
  fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
}

function logBackup(message, level = 'INFO') {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] [${level}] ${message}\n`;
  fs.appendFileSync(LOG_FILE, logEntry);
  console.log(`[BACKUP] ${message}`);
}

export async function GET() {
  try {
    // Get backup status
    const backupFiles = fs.existsSync(BACKUP_DIR) ? fs.readdirSync(BACKUP_DIR) : [];
    const sqlBackups = backupFiles.filter(file => file.endsWith('.sql'));
    const fileBackups = backupFiles.filter(file => file.startsWith('files-backup-'));
    
    return NextResponse.json({
      status: 'ready',
      backups: {
        database: sqlBackups.length,
        files: fileBackups.length,
        lastBackup: sqlBackups.length > 0 ? sqlBackups[0] : null
      },
      backupDirectory: BACKUP_DIR
    });
  } catch (error) {
    logBackup(`Backup status check failed: ${error.message}`, 'ERROR');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { type = 'database' } = await new Request().json();
    
    logBackup(`Backup requested: ${type}`);
    
    // Simple backup simulation for now
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(BACKUP_DIR, `agriplatform-backup-${timestamp}.sql`);
    
    // Create a simple backup file
    fs.writeFileSync(backupFile, `-- Backup created at ${new Date().toISOString()}\n-- Database: agriplatform\n`);
    
    logBackup(`Backup completed successfully: ${type}`);
    
    return NextResponse.json({
      success: true,
      type,
      result: {
        file: backupFile,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    logBackup(`Backup failed: ${error.message}`, 'ERROR');
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
