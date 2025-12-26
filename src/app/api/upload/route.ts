import { NextRequest, NextResponse } from 'next/server';
import { documentProcessor } from '@/lib/document-processor';
import { qdrantClient } from '@/lib/vectorstore';
import { ragChain } from '@/lib/rag';
import { UploadResponse } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    // Parse the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only PDF and TXT files are supported.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Processing file: ${file.name}`);

    // Process the document into chunks
    const chunks = await documentProcessor.processFile(
      buffer,
      file.name,
      file.type
    );

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: 'No text content could be extracted from the file' },
        { status: 400 }
      );
    }

    console.log(`Document split into ${chunks.length} chunks`);

    // Generate a unique collection ID
    const collectionId = `doc_${uuidv4().substring(0, 8)}`;

    // Initialize Qdrant collection
    await qdrantClient.initCollection(collectionId);

    // Generate embeddings for all chunks
    const texts = chunks.map((chunk) => chunk.text);
    const embeddings = await ragChain.embedDocuments(texts);

    console.log(`Generated ${embeddings.length} embeddings`);

    // Add chunks to Qdrant
    await qdrantClient.addDocuments(collectionId, chunks, embeddings);

    console.log(`Added ${chunks.length} chunks to collection ${collectionId}`);

    const response: UploadResponse = {
      collectionId,
      chunksCount: chunks.length,
      fileName: file.name,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process file',
      },
      { status: 500 }
    );
  }
}
