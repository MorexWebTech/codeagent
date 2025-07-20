import React, { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useTheme } from 'next-themes';
import { FileNode } from '@/hooks/useFileSystem';

interface CodeEditorProps {
  file: FileNode | null;
  onContentChange: (content: string) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ file, onContentChange }) => {
  const { theme } = useTheme();
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    // Configure editor
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      tabSize: 2,
      insertSpaces: true,
    });
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      onContentChange(value);
    }
  };

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center bg-background">
        <div className="text-center text-muted-foreground">
          <p className="text-lg mb-2">Welcome to FUS AI Bot</p>
          <p className="text-sm">Select a file from the explorer to start editing</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-2 bg-background">
        <span className="text-sm font-medium">{file.name}</span>
      </div>
      <div className="flex-1">
        <Editor
          height="100%"
          language={file.language || 'plaintext'}
          value={file.content || ''}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            wordWrap: 'on',
            automaticLayout: true,
            scrollBeyondLastLine: false,
            minimap: { enabled: window.innerWidth > 1024 },
            fontSize: 14,
            lineNumbers: 'on',
            renderWhitespace: 'selection',
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>
    </div>
  );
};