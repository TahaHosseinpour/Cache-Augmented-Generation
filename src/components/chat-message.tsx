'use client';

import { Message } from '@/types';
import { User, Bot, Zap, Database } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isFromCache = !isUser && message.source === 'cache';

  return (
    <div
      className={cn(
        'flex gap-3 p-4 rounded-lg transition-colors',
        isUser ? 'bg-secondary/50' : isFromCache ? 'bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800' : 'bg-muted/50'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
        )}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          {!isUser && message.source && (
            <div className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1 text-xs px-2 py-1 rounded-full",
                message.source === 'cache'
                  ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 font-semibold'
                  : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
              )}>
                {message.source === 'cache' ? (
                  <>
                    <Zap className="w-3 h-3" />
                    <span>Cached</span>
                    {message.similarity && (
                      <span className="ml-1">
                        ({(message.similarity * 100).toFixed(0)}%)
                      </span>
                    )}
                  </>
                ) : (
                  <>
                    <Database className="w-3 h-3" />
                    <span>Vector DB</span>
                  </>
                )}
              </div>
              {message.responseTime && (
                <div className={cn(
                  "flex items-center gap-1 text-xs px-2 py-1 rounded-full font-mono",
                  message.source === 'cache'
                    ? 'bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400'
                    : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                )}>
                  <span>{message.responseTime}ms</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {message.content}
        </div>
      </div>
    </div>
  );
}
