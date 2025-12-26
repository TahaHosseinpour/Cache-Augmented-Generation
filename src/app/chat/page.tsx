'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ChatMessage } from '@/components/chat-message';
import { ChatInput } from '@/components/chat-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Message } from '@/types';
import { ArrowLeft, FileText } from 'lucide-react';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const collectionId = searchParams.get('collectionId');
  const fileName = searchParams.get('fileName');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collectionId) {
      router.push('/');
    }
  }, [collectionId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    if (!collectionId) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Start timing
    const startTime = performance.now();

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: content,
          collectionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();

      // Calculate response time
      const endTime = performance.now();
      const responseTime = Math.round(endTime - startTime);

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        source: data.source,
        similarity: data.similarity,
        timestamp: Date.now(),
        responseTime,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error processing your question. Please try again.',
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!collectionId) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-secondary/20">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <h1 className="font-semibold">
                  {fileName ? decodeURIComponent(fileName) : 'Document Chat'}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Collection: {collectionId}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 max-w-4xl">
        <Card className="h-full flex flex-col">
          <CardHeader>
            <CardTitle>Chat with your document</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col gap-4">
            <div className="flex-1 overflow-y-auto space-y-4 min-h-[400px] max-h-[600px]">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                  <div>
                    <p className="text-lg font-medium mb-2">
                      Start a conversation
                    </p>
                    <p className="text-sm">
                      Ask questions about your document and I'll help you find answers
                    </p>
                  </div>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t pt-4">
              <ChatInput onSend={handleSendMessage} disabled={isLoading} />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChatPageContent />
    </Suspense>
  );
}
