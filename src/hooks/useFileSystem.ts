import { useState, useCallback } from 'react';
import { saveAs } from 'file-saver';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  content?: string;
  language?: string;
  children?: FileNode[];
  parent?: string;
}

export const useFileSystem = () => {
  const [files, setFiles] = useState<FileNode[]>([
    {
      id: '1',
      name: 'src',
      type: 'folder',
      children: [
        {
          id: '2',
          name: 'App.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React from 'react';

function App() {
  return (
    <div className="App">
      <h1>Hello World</h1>
    </div>
  );
}

export default App;`,
          parent: '1'
        },
        {
          id: '3',
          name: 'index.css',
          type: 'file',
          language: 'css',
          content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}`,
          parent: '1'
        }
      ]
    }
  ]);

  const [activeFile, setActiveFile] = useState<string | null>('2');

  const createFile = useCallback((name: string, parentId?: string, content = '') => {
    const newFile: FileNode = {
      id: Date.now().toString(),
      name,
      type: 'file',
      content,
      language: getLanguageFromExtension(name),
      parent: parentId
    };

    setFiles(prev => {
      if (!parentId) {
        return [...prev, newFile];
      }

      return prev.map(file => {
        if (file.id === parentId && file.type === 'folder') {
          return {
            ...file,
            children: [...(file.children || []), newFile]
          };
        }
        return file;
      });
    });

    return newFile.id;
  }, []);

  const createFolder = useCallback((name: string, parentId?: string) => {
    const newFolder: FileNode = {
      id: Date.now().toString(),
      name,
      type: 'folder',
      children: [],
      parent: parentId
    };

    setFiles(prev => {
      if (!parentId) {
        return [...prev, newFolder];
      }

      return prev.map(file => {
        if (file.id === parentId && file.type === 'folder') {
          return {
            ...file,
            children: [...(file.children || []), newFolder]
          };
        }
        return file;
      });
    });

    return newFolder.id;
  }, []);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFiles(prev => updateFileInTree(prev, fileId, { content }));
  }, []);

  const deleteFile = useCallback((fileId: string) => {
    setFiles(prev => removeFileFromTree(prev, fileId));
    if (activeFile === fileId) {
      setActiveFile(null);
    }
  }, [activeFile]);

  const getFileById = useCallback((fileId: string): FileNode | null => {
    return findFileInTree(files, fileId);
  }, [files]);

  const downloadFile = useCallback((fileId: string) => {
    const file = getFileById(fileId);
    if (file && file.type === 'file' && file.content) {
      const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
      saveAs(blob, file.name);
    }
  }, [getFileById]);

  const exportProject = useCallback(() => {
    const projectData = JSON.stringify(files, null, 2);
    const blob = new Blob([projectData], { type: 'application/json' });
    saveAs(blob, 'project.json');
  }, [files]);

  return {
    files,
    activeFile,
    setActiveFile,
    createFile,
    createFolder,
    updateFileContent,
    deleteFile,
    getFileById,
    downloadFile,
    exportProject
  };
};

// Helper functions
const getLanguageFromExtension = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const languageMap: Record<string, string> = {
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'html': 'html',
    'css': 'css',
    'scss': 'scss',
    'json': 'json',
    'md': 'markdown',
    'yaml': 'yaml',
    'yml': 'yaml'
  };
  return languageMap[ext || ''] || 'plaintext';
};

const updateFileInTree = (files: FileNode[], fileId: string, updates: Partial<FileNode>): FileNode[] => {
  return files.map(file => {
    if (file.id === fileId) {
      return { ...file, ...updates };
    }
    if (file.children) {
      return {
        ...file,
        children: updateFileInTree(file.children, fileId, updates)
      };
    }
    return file;
  });
};

const removeFileFromTree = (files: FileNode[], fileId: string): FileNode[] => {
  return files.filter(file => {
    if (file.id === fileId) {
      return false;
    }
    if (file.children) {
      file.children = removeFileFromTree(file.children, fileId);
    }
    return true;
  });
};

const findFileInTree = (files: FileNode[], fileId: string): FileNode | null => {
  for (const file of files) {
    if (file.id === fileId) {
      return file;
    }
    if (file.children) {
      const found = findFileInTree(file.children, fileId);
      if (found) return found;
    }
  }
  return null;
};