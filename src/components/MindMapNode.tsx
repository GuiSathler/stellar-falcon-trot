"use client";

import React, { memo, useState } from 'react';
import { Handle, Position, NodeProps, useReactFlow } from '@xyflow/react';
import { Plus, Trash2, Check } from 'lucide-react';

const MindMapNode = ({ id, data, selected }: NodeProps) => {
  const { setNodes } = useReactFlow();
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data.label as string);

  const handleDoubleClick = () => setIsEditing(true);
  
  const handleBlur = () => {
    setIsEditing(false);
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, label } };
        }
        return node;
      })
    );
  };

  const onDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNodes((nds) => nds.filter((node) => node.id !== id));
  };

  return (
    <div 
      onDoubleClick={handleDoubleClick}
      className={`group px-4 py-3 shadow-lg rounded-xl border-2 bg-white transition-all duration-300 min-w-[140px] ${
        selected ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-100 hover:border-blue-200'
      }`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-400 border-2 border-white" />
      
      <div className="flex flex-col gap-1">
        {isEditing ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              className="text-sm font-medium text-gray-700 outline-none w-full bg-blue-50 rounded px-1"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
            />
            <Check size={14} className="text-green-500" />
          </div>
        ) : (
          <span className="text-sm font-semibold text-gray-800">{label}</span>
        )}
        
        <div className="flex items-center justify-between mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={onDelete}
            className="p-1 hover:bg-red-50 text-red-400 hover:text-red-600 rounded transition-colors"
          >
            <Trash2 size={14} />
          </button>
          
          {selected && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                if (typeof data.onAddChild === 'function') data.onAddChild();
              }}
              className="bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors shadow-md"
            >
              <Plus size={14} />
            </button>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-400 border-2 border-white" />
    </div>
  );
};

export default memo(MindMapNode);