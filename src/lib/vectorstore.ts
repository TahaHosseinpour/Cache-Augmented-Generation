import { DocumentChunk } from '@/types';

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

interface PointStruct {
  id: string;
  vector: number[];
  payload: {
    text: string;
    source: string;
    chunkIndex: number;
  };
}

interface SearchResult {
  id: string;
  score: number;
  payload: {
    text: string;
    source: string;
    chunkIndex: number;
  };
}

export class QdrantClient {
  private baseUrl: string;
  private apiKey?: string;

  constructor() {
    this.baseUrl = QDRANT_URL;
    this.apiKey = QDRANT_API_KEY;
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['api-key'] = this.apiKey;
    }
    return headers;
  }

  async initCollection(collectionName: string, vectorSize: number = 1536): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${collectionName}`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            vectors: {
              size: vectorSize,
              distance: 'Cosine',
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to create collection: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error initializing collection:', error);
      throw error;
    }
  }

  async addDocuments(
    collectionName: string,
    chunks: DocumentChunk[],
    embeddings: number[][]
  ): Promise<void> {
    try {
      const points: PointStruct[] = chunks.map((chunk, index) => ({
        id: chunk.id,
        vector: embeddings[index],
        payload: {
          text: chunk.text,
          source: chunk.metadata.source,
          chunkIndex: chunk.metadata.chunkIndex,
        },
      }));

      const response = await fetch(
        `${this.baseUrl}/collections/${collectionName}/points?wait=true`,
        {
          method: 'PUT',
          headers: this.getHeaders(),
          body: JSON.stringify({
            points,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to add documents: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error adding documents:', error);
      throw error;
    }
  }

  async similaritySearch(
    collectionName: string,
    queryEmbedding: number[],
    k: number = 4
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${collectionName}/points/search`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify({
            vector: queryEmbedding,
            limit: k,
            with_payload: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to search: ${response.statusText}`);
      }

      const data = await response.json();
      return data.result || [];
    } catch (error) {
      console.error('Error searching:', error);
      throw error;
    }
  }

  async deleteCollection(collectionName: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${collectionName}`,
        {
          method: 'DELETE',
          headers: this.getHeaders(),
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to delete collection: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      console.error('Qdrant health check failed:', error);
      return false;
    }
  }
}

export const qdrantClient = new QdrantClient();
