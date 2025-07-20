import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLocalAI } from '@/hooks/useLocalAI';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface AIChatProps {
  onCodeGenerated: (code: string) => void;
}

export const AIChat: React.FC<AIChatProps> = ({ onCodeGenerated }) => {
  const [input, setInput] = useState('');
  const {
    isLoading,
    isModelLoaded,
    messages,
    generateCode,
    loadModel,
    clearMessages
  } = useLocalAI();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userInput = input.trim();
    setInput('');

    try {
      if (!isModelLoaded) {
        toast({
          title: "Loading AI Model",
          description: "Please wait while we load the local AI model...",
        });
        await loadModel();
      }

      const generatedCode = await generateCode(userInput);
      onCodeGenerated(generatedCode);
      
      toast({
        title: "Code Generated",
        description: "AI has generated code based on your request.",
      });
    } catch (error) {
      console.error('AI generation failed:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate code. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleLoadModel = async () => {
    try {
      await loadModel();
      toast({
        title: "Model Loaded",
        description: "Local AI model is ready to use!",
      });
    } catch (error) {
      toast({
        title: "Model Load Failed",
        description: "Failed to load the AI model. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain size={16} />
            <span className="text-sm font-medium">AI Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isModelLoaded ? "default" : "secondary"} className="text-xs">
              {isModelLoaded ? (
                <>
                  <Zap size={12} className="mr-1" />
                  Ready
                </>
              ) : (
                'Not Loaded'
              )}
            </Badge>
            {!isModelLoaded && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLoadModel}
                disabled={isLoading}
                className="h-6 text-xs"
              >
                {isLoading ? <Loader2 size={12} className="animate-spin" /> : 'Load AI'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground">
              <Bot size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm mb-2">Welcome to FUS AI Bot</p>
              <p className="text-xs">Ask me to generate code, explain concepts, or help with your project!</p>
              {!isModelLoaded && (
                <p className="text-xs mt-2 text-amber-600">
                  Load the AI model to start chatting
                </p>
              )}
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="flex-shrink-0">
                  {message.role === 'user' ? (
                    <User size={20} className="text-primary" />
                  ) : (
                    <Bot size={20} className="text-green-500" />
                  )}
                </div>
                <div
                  className={`rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <pre className="text-sm whitespace-pre-wrap font-mono">
                    {message.content}
                  </pre>
                  <div className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3">
              <Bot size={20} className="text-green-500" />
              <div className="bg-muted rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  <span className="text-sm">Generating...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI to generate code..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="sm"
          >
            {isLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
          </Button>
        </form>
        
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearMessages}
            className="w-full mt-2 text-xs"
          >
            Clear Chat
          </Button>
        )}
      </div>
    </div>
  );
};