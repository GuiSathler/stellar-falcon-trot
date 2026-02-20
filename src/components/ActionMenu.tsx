"use client";

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2, Edit2 } from 'lucide-react';

interface ActionMenuProps {
  onDelete: () => void;
  onRename?: () => void;
  label?: string;
}

export const ActionMenu = ({ onDelete, onRename, label }: ActionMenuProps) => {
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
      <DropdownMenuContent align="end" className="w-40">
        {onRename && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onRename(); }}>
            <Edit2 className="mr-2 h-4 w-4" />
            <span>Renomear</span>
          </DropdownMenuItem>
        )}
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