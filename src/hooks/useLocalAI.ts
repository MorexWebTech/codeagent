import { useState, useCallback } from 'react';
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js
env.allowLocalModels = false;
env.useBrowserCache = true;

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
  prompt?: string;
}

export const useLocalAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [model, setModel] = useState<any>(null);

  const loadModel = useCallback(async () => {
    if (model) return model;
    
    try {
      setIsLoading(true);
      console.log('Loading local AI model...');
      
      // Use a lightweight model for code generation
      const generator = await pipeline(
        'text-generation',
        'Xenova/gpt2',
        { device: 'webgpu' }
      );
      
      setModel(generator);
      setIsModelLoaded(true);
      console.log('Model loaded successfully');
      
      return generator;
    } catch (error) {
      console.error('Failed to load model:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [model]);

  const generateCode = useCallback(async (
    prompt: string, 
    options: AIGenerationOptions = {}
  ): Promise<string> => {
    try {
      setIsLoading(true);
      
      const generator = await loadModel();
      if (!generator) throw new Error('Model not loaded');

      // Add user message
      const userMessage: AIMessage = {
        role: 'user',
        content: prompt,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // Generate response
      const codePrompt = `// Generate ${prompt}
${options.prompt || ''}`;

      const result = await generator(codePrompt, {
        max_length: options.maxTokens || 150,
        temperature: options.temperature || 0.7,
        do_sample: true,
      });

      const generatedText = result[0].generated_text.replace(codePrompt, '').trim();
      
      // Add assistant message
      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: generatedText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      return generatedText;
    } catch (error) {
      console.error('Code generation failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loadModel]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    isLoading,
    isModelLoaded,
    messages,
    generateCode,
    loadModel,
    clearMessages
  };
};