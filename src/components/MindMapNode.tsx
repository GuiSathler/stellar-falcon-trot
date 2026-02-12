"use client";

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Plus } from 'lucide-react';

const MindMapNode = ({ data, selected }: NodeProps) => {
  return (
    <div className={`px-4 py-2 shadow-sm rounded-lg border-2 bg-white transition-all duration-200 ${
      selected ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
    }`}>
      <Handle type="target" position={Position.Left} className="w-2 h-2 !bg-blue-400" />
      
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-700">{data.label as string}</span>
        
        {selected && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              if (typeof data.onAddChild === 'function') {
                data.onAddChild();
              }
            }}
            className="absolute -right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full p-1 hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus size={12} />
          </button>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 !bg-blue-400" />
    </div>
  );
};

export default memo(MindMapNode);