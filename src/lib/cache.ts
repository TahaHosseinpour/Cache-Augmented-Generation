import { createClient, RedisClientType } from 'redis';
import { OpenAIEmbeddings } from '@langchain/openai';
import { CacheResult } from '@/types';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.85');

export class SemanticCache {
  private client: RedisClientType | null = null;
  private embeddings: OpenAIEmbeddings;
  private isConnected: boolean = false;

  constructor() {
    this.embeddings = new OpenAIEmbeddings({
      modelName: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected && this.client) {
      return;
    }

    try {
      this.client = createClient({
        url: REDIS_URL,
      });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      await this.client.connect();
      this.isConnected = true;
      console.log('Connected to Redis');
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    const dotProduct = vecA.reduce((sum, a, idx) => sum + a * vecB[idx], 0);
    const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }

  async get(
    query: string,
    collectionId: string
  ): Promise<CacheResult | null> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Get all cached queries for this collection
      const cacheKeys = await this.client!.keys(`cache:${collectionId}:*`);

      let bestMatch: CacheResult | null = null;
      let highestSimilarity = 0;

      for (const key of cacheKeys) {
        const cachedData = await this.client!.get(key);
        if (!cachedData) continue;

        const cached = JSON.parse(cachedData);
        const similarity = this.cosineSimilarity(
          queryEmbedding,
          cached.embedding
        );

        if (similarity > highestSimilarity && similarity >= SIMILARITY_THRESHOLD) {
          highestSimilarity = similarity;
          bestMatch = {
            response: cached.response,
            similarity,
            timestamp: cached.timestamp,
          };
        }
      }

      if (bestMatch) {
        console.log(`Cache hit! Similarity: ${bestMatch.similarity.toFixed(4)}`);
        return bestMatch;
      }

      return null;
    } catch (error) {
      console.error('Error retrieving from cache:', error);
      return null;
    }
  }

  async set(
    query: string,
    response: string,
    collectionId: string,
    ttl: number = 3600 // 1 hour default
  ): Promise<void> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      // Generate embedding for the query
      const queryEmbedding = await this.embeddings.embedQuery(query);

      // Create a unique key based on query hash
      const queryHash = Buffer.from(query).toString('base64').substring(0, 16);
      const cacheKey = `cache:${collectionId}:${queryHash}`;

      const cacheData = {
        query,
        response,
        embedding: queryEmbedding,
        timestamp: Date.now(),
      };

      // Store in Redis with TTL
      await this.client!.setEx(cacheKey, ttl, JSON.stringify(cacheData));
      console.log('Cached response for query');
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      if (!this.client || !this.isConnected) {
        await this.connect();
      }
      const pong = await this.client!.ping();
      return pong === 'PONG';
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  async clearCollection(collectionId: string): Promise<void> {
    if (!this.client || !this.isConnected) {
      await this.connect();
    }

    try {
      const keys = await this.client!.keys(`cache:${collectionId}:*`);
      if (keys.length > 0) {
        await this.client!.del(keys);
      }
      console.log(`Cleared ${keys.length} cache entries for collection ${collectionId}`);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  }
}

export const semanticCache = new SemanticCache();
