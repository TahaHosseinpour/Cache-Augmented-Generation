import { NextRequest, NextResponse } from 'next/server';
import { ragChain } from '@/lib/rag';
import { ChatRequest, ChatResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ChatRequest;
    const { query, collectionId } = body;

    if (!query || !collectionId) {
      return NextResponse.json(
        { error: 'Missing required fields: query and collectionId' },
        { status: 400 }
      );
    }

    console.log(`Processing query for collection: ${collectionId}`);
    console.log(`Query: ${query}`);

    // Use RAG chain with semantic cache
    const response: ChatResponse = await ragChain.query(query, collectionId);

    console.log(`Response source: ${response.source}`);

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process query',
      },
      { status: 500 }
    );
  }
}
