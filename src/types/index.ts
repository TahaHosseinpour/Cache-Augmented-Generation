export interface DocumentChunk {
  id: string;
  text: string;
  metadata: {
    source: string;
    chunkIndex: number;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  source?: 'cache' | 'vectordb';
  similarity?: number;
  timestamp?: number;
  responseTime?: number; // in milliseconds
}

export interface ChatRequest {
  query: string;
  collectionId: string;
}

export interface ChatResponse {
  response: string;
  source: 'cache' | 'vectordb';
  similarity?: number;
  sources?: string[];
}

export interface UploadResponse {
  collectionId: string;
  chunksCount: number;
  fileName: string;
}

export interface CacheResult {
  response: string;
  similarity: number;
  timestamp: number;
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  redis: boolean;
  qdrant: boolean;
  message?: string;
}
