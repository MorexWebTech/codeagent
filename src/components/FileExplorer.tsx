import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Plus, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFileSystem, FileNode } from '@/hooks/useFileSystem';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';

interface FileExplorerProps {
  onFileSelect: (fileId: string) => void;
  activeFile: string | null;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ onFileSelect, activeFile }) => {
  const {
    files,
    createFile,
    createFolder,
    deleteFile,
    downloadFile,
    exportProject
  } = useFileSystem();
  
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['1']));
  const [newItemName, setNewItemName] = useState('');
  const [creatingItem, setCreatingItem] = useState<{ type: 'file' | 'folder'; parentId?: string } | null>(null);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const handleCreateItem = () => {
    if (!newItemName.trim() || !creatingItem) return;

    if (creatingItem.type === 'file') {
      const fileId = createFile(newItemName, creatingItem.parentId);
      onFileSelect(fileId);
    } else {
      createFolder(newItemName, creatingItem.parentId);
    }

    setNewItemName('');
    setCreatingItem(null);
  };

  const renderFileNode = (node: FileNode, depth = 0) => {
    const isExpanded = expandedFolders.has(node.id);
    const isActive = activeFile === node.id;

    return (
      <div key={node.id}>
        <ContextMenu>
          <ContextMenuTrigger>
            <div
              className={`flex items-center gap-2 py-1 px-2 hover:bg-accent cursor-pointer rounded-sm ${
                isActive ? 'bg-accent' : ''
              }`}
              style={{ paddingLeft: `${depth * 16 + 8}px` }}
              onClick={() => {
                if (node.type === 'folder') {
                  toggleFolder(node.id);
                } else {
                  onFileSelect(node.id);
                }
              }}
            >
              {node.type === 'folder' ? (
                <>
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <Folder size={16} className="text-blue-500" />
                </>
              ) : (
                <>
                  <div style={{ width: 16 }} />
                  <File size={16} className="text-gray-500" />
                </>
              )}
              <span className="text-sm truncate">{node.name}</span>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent className="bg-background border">
            {node.type === 'folder' && (
              <>
                <ContextMenuItem onClick={() => setCreatingItem({ type: 'file', parentId: node.id })}>
                  <Plus size={16} className="mr-2" />
                  New File
                </ContextMenuItem>
                <ContextMenuItem onClick={() => setCreatingItem({ type: 'folder', parentId: node.id })}>
                  <Plus size={16} className="mr-2" />
                  New Folder
                </ContextMenuItem>
              </>
            )}
            {node.type === 'file' && (
              <ContextMenuItem onClick={() => downloadFile(node.id)}>
                <Download size={16} className="mr-2" />
                Download
              </ContextMenuItem>
            )}
            <ContextMenuItem onClick={() => deleteFile(node.id)} className="text-red-600">
              <Trash2 size={16} className="mr-2" />
              Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {node.type === 'folder' && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderFileNode(child, depth + 1))}
            {creatingItem?.parentId === node.id && (
              <div
                className="flex items-center gap-2 py-1 px-2"
                style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
              >
                <div style={{ width: 16 }} />
                {creatingItem.type === 'file' ? (
                  <File size={16} className="text-gray-500" />
                ) : (
                  <Folder size={16} className="text-blue-500" />
                )}
                <Input
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreateItem();
                    if (e.key === 'Escape') setCreatingItem(null);
                  }}
                  onBlur={handleCreateItem}
                  className="h-6 text-sm"
                  placeholder={`New ${creatingItem.type}`}
                  autoFocus
                />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <h3 className="font-semibold text-sm">Explorer</h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreatingItem({ type: 'file' })}
            className="h-6 w-6 p-0"
          >
            <Plus size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCreatingItem({ type: 'folder' })}
            className="h-6 w-6 p-0"
          >
            <Folder size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportProject}
            className="h-6 w-6 p-0"
          >
            <Download size={14} />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        {files.map(file => renderFileNode(file))}
        {creatingItem && !creatingItem.parentId && (
          <div className="flex items-center gap-2 py-1 px-2">
            <div style={{ width: 16 }} />
            {creatingItem.type === 'file' ? (
              <File size={16} className="text-gray-500" />
            ) : (
              <Folder size={16} className="text-blue-500" />
            )}
            <Input
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateItem();
                if (e.key === 'Escape') setCreatingItem(null);
              }}
              onBlur={handleCreateItem}
              className="h-6 text-sm"
              placeholder={`New ${creatingItem.type}`}
              autoFocus
            />
          </div>
        )}
      </div>
    </div>
  );
};