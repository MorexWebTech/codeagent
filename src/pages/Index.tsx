import React, { useState } from 'react';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { FileExplorer } from '@/components/FileExplorer';
import { CodeEditor } from '@/components/CodeEditor';
import { AIChat } from '@/components/AIChat';
import { useFileSystem } from '@/hooks/useFileSystem';
import { Button } from '@/components/ui/button';
import { Play, Settings, Brain } from 'lucide-react';

const Index = () => {
  const {
    files,
    activeFile,
    setActiveFile,
    updateFileContent,
    getFileById,
    createFile
  } = useFileSystem();
  
  const [showPreview, setShowPreview] = useState(false);
  
  const currentFile = activeFile ? getFileById(activeFile) : null;

  const handleFileSelect = (fileId: string) => {
    setActiveFile(fileId);
  };

  const handleContentChange = (content: string) => {
    if (activeFile) {
      updateFileContent(activeFile, content);
    }
  };

  const handleCodeGenerated = (code: string) => {
    if (activeFile) {
      // Replace current file content with generated code
      updateFileContent(activeFile, code);
    } else {
      // Create a new file with generated code
      const fileId = createFile('generated.js', undefined, code);
      setActiveFile(fileId);
    }
  };

  const runCode = () => {
    setShowPreview(!showPreview);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b px-4 py-2 flex items-center justify-between bg-background">
        <div className="flex items-center gap-2">
          <Brain className="text-primary" size={24} />
          <h1 className="text-lg font-bold">FUS AI Bot</h1>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            Local AI Coding Agent
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={runCode}
            className="flex items-center gap-2"
          >
            <Play size={16} />
            {showPreview ? 'Hide Preview' : 'Run Code'}
          </Button>
          <Button variant="ghost" size="sm">
            <Settings size={16} />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* File Explorer */}
          <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
            <FileExplorer
              onFileSelect={handleFileSelect}
              activeFile={activeFile}
            />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* Editor Area */}
          <ResizablePanel defaultSize={showPreview ? 40 : 60}>
            <CodeEditor
              file={currentFile}
              onContentChange={handleContentChange}
            />
          </ResizablePanel>
          
          <ResizableHandle />
          
          {/* AI Chat / Preview */}
          <ResizablePanel defaultSize={showPreview ? 40 : 20} minSize={20}>
            <ResizablePanelGroup direction="vertical">
              <ResizablePanel defaultSize={70}>
                <AIChat onCodeGenerated={handleCodeGenerated} />
              </ResizablePanel>
              
              {showPreview && (
                <>
                  <ResizableHandle />
                  <ResizablePanel defaultSize={30}>
                    <div className="h-full border-t bg-background">
                      <div className="border-b px-4 py-2">
                        <span className="text-sm font-medium">Live Preview</span>
                      </div>
                      <div className="p-4 h-full bg-white">
                        <div className="text-center text-muted-foreground">
                          <p className="text-sm">Preview panel - Run your code here</p>
                        </div>
                      </div>
                    </div>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default Index;
