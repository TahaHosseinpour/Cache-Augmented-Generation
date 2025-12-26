import { NextResponse } from 'next/server';
import { qdrantClient } from '@/lib/vectorstore';
import { semanticCache } from '@/lib/cache';
import { HealthCheckResponse } from '@/types';

export async function GET() {
  try {
    // Check Redis health
    const redisHealthy = await semanticCache.checkHealth();

    // Check Qdrant health
    const qdrantHealthy = await qdrantClient.checkHealth();

    const allHealthy = redisHealthy && qdrantHealthy;

    const response: HealthCheckResponse = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      redis: redisHealthy,
      qdrant: qdrantHealthy,
      message: allHealthy
        ? 'All systems operational'
        : 'Some services are down',
    };

    return NextResponse.json(response, {
      status: allHealthy ? 200 : 503,
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        redis: false,
        qdrant: false,
        message: 'Health check failed',
      } as HealthCheckResponse,
      { status: 503 }
    );
  }
}
