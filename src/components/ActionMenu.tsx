"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit2, Move } from 'lucide-react';

interface ActionMenuProps {
  onDelete: () => void;
  onRename?: () => void;
  onMove?: (workspaceId: string) => void;
  workspaces?: { id: string, name: string }[];
  label?: string;
}

export const ActionMenu = ({ onDelete, onRename, onMove, workspaces, label }: ActionMenuProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button 
          onClick={(e) => e.stopPropagation()}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
        >
          <MoreHorizontal size={16} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onRename && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Renomear</span>
          </DropdownMenuItem>
        )}
        
        {onMove && workspaces && workspaces.length > 0 && (
          <DropdownMenuSub>
            <DropdownMenuSubTrigger onClick={(e) => e.stopPropagation()}>
              <Move className="mr-2 h-4 w-4" />
              <span>Mover para...</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onMove(''); }}>
                  <span>Sem Workspace</span>
                </DropdownMenuItem>
                {workspaces.map(ws => (
                  <DropdownMenuItem key={ws.id} onClick={(e) => { e.stopPropagation(); onMove(ws.id); }}>
                    <span className="truncate">{ws.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        )}

        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir {label}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};