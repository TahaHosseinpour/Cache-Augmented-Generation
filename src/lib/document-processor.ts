import pdf from 'pdf-parse';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { DocumentChunk } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class DocumentProcessor {
  private textSplitter: RecursiveCharacterTextSplitter;

  constructor(chunkSize: number = 1000, chunkOverlap: number = 200) {
    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize,
      chunkOverlap,
      separators: ['\n\n', '\n', ' ', ''],
    });
  }

  async processPDF(buffer: Buffer, fileName: string): Promise<DocumentChunk[]> {
    try {
      // Parse PDF
      const data = await pdf(buffer);
      const text = data.text;

      // Split into chunks
      return this.createChunks(text, fileName);
    } catch (error) {
      console.error('Error processing PDF:', error);
      throw new Error('Failed to process PDF file');
    }
  }

  async processTXT(buffer: Buffer, fileName: string): Promise<DocumentChunk[]> {
    try {
      // Convert buffer to text
      const text = buffer.toString('utf-8');

      // Split into chunks
      return this.createChunks(text, fileName);
    } catch (error) {
      console.error('Error processing TXT:', error);
      throw new Error('Failed to process TXT file');
    }
  }

  private async createChunks(
    text: string,
    source: string
  ): Promise<DocumentChunk[]> {
    // Split text into chunks
    const splits = await this.textSplitter.splitText(text);

    // Create document chunks with metadata
    const chunks: DocumentChunk[] = splits.map((chunk, index) => ({
      id: uuidv4(),
      text: chunk,
      metadata: {
        source,
        chunkIndex: index,
      },
    }));

    return chunks;
  }

  async processFile(
    buffer: Buffer,
    fileName: string,
    fileType: string
  ): Promise<DocumentChunk[]> {
    const lowerFileType = fileType.toLowerCase();

    if (lowerFileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return this.processPDF(buffer, fileName);
    } else if (
      lowerFileType === 'text/plain' ||
      fileName.endsWith('.txt')
    ) {
      return this.processTXT(buffer, fileName);
    } else {
      throw new Error('Unsupported file type. Only PDF and TXT files are supported.');
    }
  }
}

export const documentProcessor = new DocumentProcessor();
