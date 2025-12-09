import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency?: number; error?: string };
    ai: { gemini: boolean; openai: boolean };
    memory: { used: number; total: number };
  };
}

export async function GET() {
  const startTime = Date.now();
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: {
      database: { status: 'unknown' },
      ai: {
        gemini: !!process.env.GEMINI_API_KEY,
        openai: !!process.env.OPENAI_API_KEY,
      },
      memory: {
        used: 0,
        total: 0,
      },
    },
  };

  // Check database connection
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = {
      status: 'connected',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    health.checks.database = {
      status: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    health.status = 'degraded';
  }

  // Check memory usage (Node.js)
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const mem = process.memoryUsage();
    health.checks.memory = {
      used: Math.round(mem.heapUsed / 1024 / 1024),
      total: Math.round(mem.heapTotal / 1024 / 1024),
    };
  }

  // Check if AI is available
  if (!health.checks.ai.gemini && !health.checks.ai.openai) {
    health.status = 'degraded';
  }

  // Determine overall status
  if (health.checks.database.status === 'disconnected') {
    health.status = 'unhealthy';
  }

  const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
