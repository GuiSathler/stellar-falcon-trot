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
  Mail, 
  Shield, 
  Trash2, 
  Loader2, 
  UserPlus,
  AlertCircle
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
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaborationRole>('viewer');
  const [members, setMembers] = useState<any[]>([]);
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
          created_at,
          profiles:user_id (email)
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
    const targetEmail = email.trim().toLowerCase();
    if (!targetEmail) return;

    setIsInviting(true);
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', targetEmail)
        .maybeSingle();

      if (profileError) throw profileError;

      if (!profileData) {
        throw new Error("Usuário não encontrado. O colaborador precisa ter uma conta ativa no Boltz Map.");
      }

      const table = resource.type === 'workspace' ? 'workspace_members' : 'map_members';
      const foreignKey = resource.type === 'workspace' ? 'workspace_id' : 'map_id';

      const isAlreadyMember = members.some(m => m.user_id === profileData.id);
      if (isAlreadyMember) {
        throw new Error("Este usuário já tem acesso a este recurso.");
      }

      const { error } = await supabase
        .from(table)
        .insert([{
          [foreignKey]: resource.id,
          user_id: profileData.id,
          role
        }]);

      if (error) throw error;

      showSuccess(`Acesso concedido para ${targetEmail}`);
      setEmail('');
      fetchMembers();
    } catch (err: any) {
      showError(err.message || "Erro ao convidar usuário.");
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
      showSuccess("Membro removido.");
    } catch (err) {
      showError("Erro ao remover membro.");
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
            Convide colaboradores pelo e-mail cadastrado no Boltz Map.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="E-mail do colaborador"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12 h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white focus:ring-4 focus:ring-blue-50 transition-all"
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
              disabled={isInviting || !email}
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
                <div className="flex flex-col items-center gap-2 py-8 text-gray-400">
                  <AlertCircle size={24} strokeWidth={1.5} />
                  <p className="text-sm font-medium">Nenhum colaborador convidado.</p>
                </div>
              ) : (
                members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm">
                        <Shield size={14} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-700 truncate">
                          {member.profiles?.email || `ID: ${member.user_id.slice(0, 8)}...`}
                        </p>
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