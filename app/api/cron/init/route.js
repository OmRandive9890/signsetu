import { NextResponse } from 'next/server';
import { startCronJob } from '@/lib/cron';

// This endpoint initializes the CRON job
// In production, you might want to call this from a server startup script
// or use a service like Vercel Cron Jobs, AWS Lambda, etc.

let cronStarted = false;

export async function POST() {
  try {
    if (!cronStarted) {
      startCronJob();
      cronStarted = true;
      return NextResponse.json({ message: 'CRON job started successfully' });
    } else {
      return NextResponse.json({ message: 'CRON job already running' });
    }
  } catch (error) {
    console.error('Error starting CRON job:', error);
    return NextResponse.json({ error: 'Failed to start CRON job' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: cronStarted ? 'running' : 'stopped',
    message: cronStarted ? 'CRON job is running' : 'CRON job is not started'
  });
}

