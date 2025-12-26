import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';
import { qdrantClient } from './vectorstore';
import { semanticCache } from './cache';
import { ChatResponse } from '@/types';

const SIMILARITY_THRESHOLD = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.85');

export class RAGChain {
  private llm: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    const baseUrl = process.env.OPENAI_BASE_URL;

    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: baseUrl ? {
        baseURL: baseUrl,
      } : undefined,
    });

    this.embeddings = new OpenAIEmbeddings({
      modelName: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      openAIApiKey: process.env.OPENAI_API_KEY,
      configuration: baseUrl ? {
        baseURL: baseUrl,
      } : undefined,
    });
  }

  async query(query: string, collectionId: string): Promise<ChatResponse> {
    // Step 1: Check semantic cache first
    console.log('Checking semantic cache...');
    const cachedResult = await semanticCache.get(query, collectionId);

    if (cachedResult && cachedResult.similarity >= SIMILARITY_THRESHOLD) {
      console.log(`Cache hit! Similarity: ${cachedResult.similarity}`);
      return {
        response: cachedResult.response,
        source: 'cache',
        similarity: cachedResult.similarity,
      };
    }

    console.log('Cache miss. Querying vector database...');

    // Step 2: Generate embedding for the query
    const queryEmbedding = await this.embeddings.embedQuery(query);

    // Step 3: Search in Qdrant
    const searchResults = await qdrantClient.similaritySearch(
      collectionId,
      queryEmbedding,
      4 // top 4 results
    );

    if (searchResults.length === 0) {
      const noResultsResponse = 'I could not find any relevant information in the uploaded documents to answer your question.';
      return {
        response: noResultsResponse,
        source: 'vectordb',
        sources: [],
      };
    }

    // Step 4: Build context from retrieved documents
    const context = searchResults
      .map((result, idx) => `[${idx + 1}] ${result.payload.text}`)
      .join('\n\n');

    const sources = searchResults.map((result) => result.payload.source);

    // Step 5: Create prompt template
    const promptTemplate = PromptTemplate.fromTemplate(`
You are a helpful AI assistant. Answer the user's question based on the context provided below.

Context from documents:
{context}

Question: {question}

Instructions:
- Answer based ONLY on the provided context
- If the context doesn't contain enough information, say so
- Be concise and accurate
- Cite the source when possible

Answer:
`);

    // Step 6: Run the RAG chain
    const chain = promptTemplate.pipe(this.llm).pipe(new StringOutputParser());

    const response = await chain.invoke({
      context,
      question: query,
    });

    // Step 7: Cache the response for future queries
    await semanticCache.set(query, response, collectionId);

    return {
      response,
      source: 'vectordb',
      sources: [...new Set(sources)], // Remove duplicates
    };
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return await this.embeddings.embedDocuments(texts);
  }
}

export const ragChain = new RAGChain();
