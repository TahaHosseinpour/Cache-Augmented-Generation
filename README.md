# 🚀 Cache-Augmented Generation (CAG)

> A high-performance Next.js application that implements Cache-Augmented Generation for intelligent document chat with semantic caching and RAG.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![LangChain](https://img.shields.io/badge/LangChain-🦜-green)](https://js.langchain.com/)
[![Redis](https://img.shields.io/badge/Redis-Stack-red)](https://redis.io/)
[![Qdrant](https://img.shields.io/badge/Qdrant-Vector%20DB-blueviolet)](https://qdrant.tech/)

## ✨ Features

- 📄 **Document Processing** - Upload and process PDF or TXT files with intelligent chunking
- ⚡ **Semantic Cache** - Lightning-fast responses (50-200ms) using Redis with semantic similarity matching
- 🤖 **RAG Pipeline** - Retrieval-Augmented Generation with Qdrant vector database
- 💬 **Real-time Chat** - Interactive UI to chat with your documents
- 🔍 **Smart Search** - Efficient similarity search using OpenAI embeddings
- 🎨 **Modern UI** - Beautiful orange-themed interface with Shadcn UI
- 📊 **Performance Metrics** - See response times (cache vs. vector DB)
- 🌓 **Dark Mode** - Full dark mode support

## 🏗️ Architecture

```
┌─────────────┐
│ User Query  │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Semantic Cache     │◄─── Redis
│  (Cosine Similarity)│
└──────┬──────────────┘
       │
   Cache Hit? ──Yes──► Return (⚡ 50-200ms)
       │
       No
       │
       ▼
┌─────────────────────┐
│  Vector Search      │◄─── Qdrant
│  (Top-K Retrieval)  │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│   RAG Chain         │◄─── LangChain
│   (LLM + Context)   │
└──────┬──────────────┘
       │
       ▼
   Response (🔵 2-4s)
       │
       ▼
   Cache for future
```

## 🎯 Performance

| Operation | Time | Source |
|-----------|------|--------|
| Cache Hit | **50-200ms** | 🟢 Redis Semantic Cache |
| Vector DB | **2000-4000ms** | 🔵 Qdrant + LLM |
| **Speedup** | **10-80x faster** | With cache |

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** & **Docker Compose** ([Download](https://www.docker.com/))
- **OpenAI API Key** ([Get one](https://platform.openai.com/api-keys))

## 🚀 Quick Start

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/CAG.git
cd CAG
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://api.openai.com/v1

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Qdrant Configuration
QDRANT_URL=http://localhost:6333


# Semantic Cache Settings
SIMILARITY_THRESHOLD=0.85

# Embedding Model
EMBEDDING_MODEL=text-embedding-3-small
```

### 4️⃣ Start Docker Services

Start Redis and Qdrant using Docker Compose:

```bash
docker-compose up -d
```

Verify services are running:

```bash
docker-compose ps
```

You should see:
```
NAME                COMMAND                  SERVICE             STATUS
cag-qdrant-1        "./entrypoint.sh"        qdrant              running (healthy)
cag-redis-1         "redis-server --prot…"   redis               running (healthy)
```

### 5️⃣ Run the Development Server

```bash
npm run dev
```

### 6️⃣ Open Your Browser

Navigate to [http://localhost:3000](http://localhost:3000)

🎉 **You're ready to go!**

## 📖 Usage Guide

### Uploading Documents

1. **Go to the homepage** at `http://localhost:3000`
2. **Click or drag** a PDF or TXT file to the upload area
3. **Wait for processing** (the app will chunk and embed your document)
4. **Get redirected** to the chat interface automatically

### Chatting with Documents

1. **Ask questions** about your uploaded document
2. **See response times**:
   - 🟢 **Green badge** = Cache hit (super fast!)
   - 🔵 **Blue badge** = Vector DB (slower but accurate)
3. **Watch the performance**:
   - First query: ~2-4 seconds (Vector DB)
   - Similar queries: ~50-200ms (Cache) ⚡

### Example Queries

```
Q: "What is MAXA?"
A: [Response from Vector DB - 2843ms] 🔵

Q: "What does MAXA mean?"
A: [Response from Cache - 127ms] 🟢 (95% similarity)
```

## 🔧 API Endpoints

### Upload Document
```http
POST /api/upload
Content-Type: multipart/form-data

{
  "file": <PDF or TXT file>
}

Response:
{
  "collectionId": "doc_a4990234",
  "chunksCount": 42,
  "fileName": "document.pdf"
}
```

### Chat with Document
```http
POST /api/chat
Content-Type: application/json

{
  "query": "What is this document about?",
  "collectionId": "doc_a4990234"
}

Response:
{
  "response": "This document is about...",
  "source": "cache",  // or "vectordb"
  "similarity": 0.95,
  "sources": ["document.pdf"]
}
```

### Health Check
```http
GET /api/health

Response:
{
  "status": "healthy",
  "redis": true,
  "qdrant": true,
  "message": "All systems operational"
}
```

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn UI** | Beautiful UI components |
| **LangChain** | LLM orchestration framework |
| **OpenAI GPT-4o-mini** | Language model for responses |
| **OpenAI Embeddings** | text-embedding-3-small (1536d) |
| **Qdrant** | Vector database for similarity search |
| **Redis Stack** | Semantic cache storage |
| **pdf-parse** | PDF text extraction |
| **Docker** | Containerized services |

## 📁 Project Structure

```
CAG/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # CAG chat endpoint
│   │   │   ├── upload/route.ts        # Document upload & processing
│   │   │   └── health/route.ts        # System health check
│   │   ├── chat/page.tsx              # Chat interface
│   │   ├── page.tsx                   # Upload page
│   │   ├── layout.tsx                 # Root layout
│   │   └── globals.css                # Global styles
│   ├── components/
│   │   ├── ui/                        # Shadcn UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── input.tsx
│   │   │   └── textarea.tsx
│   │   ├── file-upload.tsx            # File upload component
│   │   ├── chat-message.tsx           # Message display
│   │   └── chat-input.tsx             # Chat input field
│   ├── lib/
│   │   ├── vectorstore.ts             # Qdrant client & operations
│   │   ├── cache.ts                   # Semantic cache (Redis)
│   │   ├── document-processor.ts      # PDF/TXT chunking
│   │   ├── rag.ts                     # RAG chain implementation
│   │   └── utils.ts                   # Utility functions
│   └── types/
│       └── index.ts                   # TypeScript interfaces
├── docker-compose.yml                 # Docker services config
├── .env.local                         # Environment variables
├── package.json
└── README.md
```

## ⚙️ Configuration

### Similarity Threshold

Control how similar queries need to be for cache hits:

```env
SIMILARITY_THRESHOLD=0.85  # Default: 85% similarity
```

- **0.90-0.95**: Strict (fewer cache hits, more accurate)
- **0.85-0.90**: Balanced (recommended)
- **0.70-0.80**: Lenient (more cache hits, less precise)

### Embedding Models

Choose your embedding model:

```env
EMBEDDING_MODEL=text-embedding-3-small  # 1536 dimensions (default)
# or
EMBEDDING_MODEL=text-embedding-3-large  # 3072 dimensions (better quality)
```

### Chunk Size

Modify in `src/lib/document-processor.ts`:

```typescript
new RecursiveCharacterTextSplitter({
  chunkSize: 1000,        // Characters per chunk
  chunkOverlap: 200,      // Overlap between chunks
});
```

## 🐛 Troubleshooting

### Docker Issues

**Problem**: Containers won't start
```bash
# Solution: Check Docker daemon
docker ps

# Restart Docker Desktop and try again
docker-compose down
docker-compose up -d
```

**Problem**: Redis connection refused
```bash
# Check Redis health
docker exec cag-redis-1 redis-cli ping
# Should return: PONG

# Check logs
docker logs cag-redis-1
```

**Problem**: Qdrant not responding
```bash
# Check Qdrant health
curl http://localhost:6333/health
# Should return: {"status":"ok"}

# Check logs
docker logs cag-qdrant-1
```

### Application Issues

**Problem**: "Module not found" errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem**: OpenAI API errors
- Verify your API key is correct in `.env.local`
- Check you have sufficient credits: https://platform.openai.com/usage
- Ensure `OPENAI_BASE_URL` is correct

**Problem**: Build errors with LangChain
```bash
# Install with legacy peer deps
npm install --legacy-peer-deps
```

### Performance Issues

**Problem**: Slow responses even with cache
- Check Redis is running: `docker ps`
- Verify cache hits in console logs
- Try lowering `SIMILARITY_THRESHOLD`

**Problem**: High memory usage
- Reduce `chunkSize` in document processor
- Limit concurrent uploads
- Restart Docker containers: `docker-compose restart`

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Add comments for complex logic
- Test thoroughly before submitting
- Update README if adding features

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [LangChain](https://js.langchain.com/) for the amazing LLM framework
- [Qdrant](https://qdrant.tech/) for the vector database
- [Shadcn UI](https://ui.shadcn.com/) for beautiful components
- [OpenAI](https://openai.com/) for GPT and embeddings

## 📧 Contact

Have questions? Feel free to:
- Open an [Issue](https://github.com/yourusername/CAG/issues)
- Start a [Discussion](https://github.com/yourusername/CAG/discussions)

---

**Built with ❤️ using Next.js, LangChain, and Qdrant**

⭐ Star this repo if you find it useful!
