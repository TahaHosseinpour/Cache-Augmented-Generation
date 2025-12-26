import { FileUpload } from '@/components/file-upload';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background to-secondary/20">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            Cache-Augmented Generation (CAG)
          </h1>
          <p className="text-lg text-muted-foreground">
            Upload your documents and chat with them using AI
          </p>
          <p className="text-sm text-muted-foreground">
            Powered by semantic caching for faster responses
          </p>
        </div>

        <FileUpload />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">📄 Document Processing</h3>
            <p className="text-sm text-muted-foreground">
              Upload PDF or TXT files and we'll process them into searchable chunks
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">⚡ Semantic Cache</h3>
            <p className="text-sm text-muted-foreground">
              Similar questions get instant responses from Redis cache
            </p>
          </div>
          <div className="p-4 rounded-lg bg-card border">
            <h3 className="font-semibold mb-2">🤖 AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Get accurate answers using RAG with vector similarity search
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
