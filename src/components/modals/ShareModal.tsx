"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Hash, 
  Shield, 
  Trash2, 
  Loader2, 
  UserPlus,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import { CollaborationRole, Member, ShareResource } from '@/types/collaboration';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  resource: ShareResource;
}

export const ShareModal = ({ isOpen, onClose, resource }: ShareModalProps) => {
  const [shareId, setShareId] = useState('');
  const [role, setRole] = useState<CollaborationRole>('viewer');
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviting, setIsInviting] = useState(false);

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const table = resource.type === 'workspace' ? 'workspace_members' : 'map_members';
      const foreignKey = resource.type === 'workspace' ? 'workspace_id' : 'map_id';

      const { data, error } = await supabase
        .from(table)
        .select(`
          id,
          user_id,
          role,
          created_at
        `)
        .eq(foreignKey, resource.id);

      if (error) throw error;
      setMembers(data || []);
    } catch (err) {
      console.error("Erro ao buscar membros:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchMembers();
  }, [isOpen, resource.id]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = shareId.trim();
    if (!cleanId) return;

    setIsInviting(true);
    try {
      // Buscar usuário pelo Boltz ID (share_id)
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('share_id', cleanId)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error("Boltz ID não encontrado. Verifique o número e tente novamente.");
      }

      const table = resource.type === 'workspace' ? 'workspace_members' : 'map_members';
      const foreignKey = resource.type === 'workspace' ? 'workspace_id' : 'map_id';

      // Verificar se já é membro
      const isAlreadyMember = members.some(m => m.user_id === profileData.id);
      if (isAlreadyMember) {
        throw new Error("Este usuário já possui acesso.");
      }

      const { error } = await supabase
        .from(table)
        .insert([{
          [foreignKey]: resource.id,
          user_id: profileData.id,
          role
        }]);

      if (error) throw error;

      showSuccess(`Usuário adicionado com sucesso!`);
      setShareId('');
      fetchMembers();
    } catch (err: any) {
      showError(err.message || "Erro ao adicionar usuário.");
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const table = resource.type === 'workspace' ? 'workspace_members' : 'map_members';
      const { error } = await supabase.from(table).delete().eq('id', memberId);
      if (error) throw error;
      setMembers(prev => prev.filter(m => m.id !== memberId));
      showSuccess("Acesso removido.");
    } catch (err) {
      showError("Erro ao remover acesso.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] border-none shadow-2xl">
        <DialogHeader>
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Users size={24} />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">Compartilhar {resource.name}</DialogTitle>
          <DialogDescription className="text-gray-500 font-medium">
            Insira o Boltz ID do colaborador para dar acesso a este {resource.type === 'workspace' ? 'espaço' : 'mapa'}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="relative flex-1">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Ex: 12345678"
                value={shareId}
                onChange={(e) => setShareId(e.target.value.replace(/\D/g, ''))}
                className="pl-12 h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all font-mono"
              />
            </div>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as CollaborationRole)}
              className="bg-gray-50 border border-gray-100 rounded-2xl px-4 text-sm font-bold text-gray-600 outline-none focus:ring-4 focus:ring-blue-50"
            >
              <option value="viewer">Ver</option>
              <option value="editor">Editar</option>
              <option value="admin">Adm</option>
            </select>
            <Button 
              type="submit" 
              disabled={isInviting || !shareId}
              className="h-12 w-12 rounded-2xl bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100 p-0"
            >
              {isInviting ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
            </Button>
          </form>

          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">Membros com acesso</h4>
            <div className="max-h-[200px] overflow-y-auto space-y-2 pr-2">
              {isLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="animate-spin text-blue-600" /></div>
              ) : members.length === 0 ? (
                <p className="text-center py-4 text-sm text-gray-400 font-medium">Nenhum colaborador adicionado ainda.</p>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                        <Shield size={14} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-700">Colaborador</p>
                        <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">{member.role}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeMember(member.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};