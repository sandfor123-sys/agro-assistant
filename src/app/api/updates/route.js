import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Simple status check
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    return NextResponse.json({
      status: 'success',
      data: {
        currentVersion: packageJson.version,
        lastChecked: new Date().toISOString()
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: error.message,
      status: 'error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const { action } = await new Request().json();
    
    if (action === 'check') {
      return NextResponse.json({
        success: true,
        message: 'Updates check completed',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
