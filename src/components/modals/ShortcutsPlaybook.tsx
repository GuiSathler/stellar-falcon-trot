"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { 
  Keyboard, 
  Plus, 
  CornerDownRight, 
  Trash2, 
  Type, 
  Bold, 
  Italic, 
  ZoomIn, 
  Undo2, 
  MousePointer2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';

interface ShortcutsPlaybookProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutItem = ({ keys, label, icon: Icon }: { keys: string[], label: string, icon: any }) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
    <div className="flex items-center gap-3">
      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
        <Icon size={16} />
      </div>
      <span className="text-sm font-medium text-gray-600">{label}</span>
    </div>
    <div className="flex gap-1.5">
      {keys.map((key, i) => (
        <kbd key={i} className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md text-[10px] font-black text-gray-500 shadow-sm">
          {key}
        </kbd>
      ))}
    </div>
  </div>
);

export const ShortcutsPlaybook = ({ isOpen, onClose }: ShortcutsPlaybookProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-100">
            <Keyboard size={24} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">Playbook de Atalhos</DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            Domine o Boltz Map com comandos rápidos de teclado.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 py-4">
          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Criação e Estrutura</h4>
            <ShortcutItem icon={Plus} label="Adicionar Tópico Filho" keys={["Tab"]} />
            <ShortcutItem icon={CornerDownRight} label="Adicionar Tópico Irmão" keys={["Enter"]} />
            <ShortcutItem icon={Trash2} label="Excluir Tópico" keys={["Del", "Backspace"]} />
          </section>

          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Edição e Estilo</h4>
            <ShortcutItem icon={Type} label="Editar Texto" keys={["F2"]} />
            <ShortcutItem icon={Bold} label="Negrito" keys={["Ctrl", "B"]} />
            <ShortcutItem icon={Italic} label="Itálico" keys={["Ctrl", "I"]} />
            <ShortcutItem icon={ArrowUp} label="Aumentar Fonte" keys={["Alt", "Shift", "↑"]} />
            <ShortcutItem icon={ArrowDown} label="Diminuir Fonte" keys={["Alt", "Shift", "↓"]} />
          </section>

          <section>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Navegação e Sistema</h4>
            <ShortcutItem icon={MousePointer2} label="Navegar entre Tópicos" keys={["Setas"]} />
            <ShortcutItem icon={ZoomIn} label="Zoom In / Out" keys={["+", "-"]} />
            <ShortcutItem icon={Undo2} label="Desfazer / Refazer" keys={["Ctrl", "Z", "Y"]} />
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
};