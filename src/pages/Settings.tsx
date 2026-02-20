"use client";

import React, { useState, useEffect } from 'react';
import { User, Shield, Bell, CreditCard, Save, Loader2, Copy, Hash } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

const Settings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [shareId, setShareId] = useState('');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data: profile } = await supabase
          .from('profiles')
          .select('share_id')
          .eq('id', user.id)
          .single();
        setShareId(profile?.share_id || '');
      }
    };
    getUser();
  }, []);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showSuccess("Configurações salvas localmente!");
    }, 1000);
  };

  const copyId = () => {
    navigator.clipboard.writeText(shareId);
    showSuccess("Boltz ID copiado!");
  };

  return (
    <div className="p-10 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-12">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Configurações</h1>
        <p className="text-gray-500 font-medium">Gerencie sua conta e preferências do Boltz Flow.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-blue-100 text-blue-600 rounded-2xl font-bold text-sm shadow-sm">
            <User size={18} />
            Perfil
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-colors">
            <Shield size={18} />
            Segurança
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-colors">
            <Bell size={18} />
            Notificações
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-2xl font-bold text-sm transition-colors">
            <CreditCard size={18} />
            Assinatura
          </button>
        </div>

        <div className="md:col-span-2 space-y-8">
          <div className="bg-white border border-gray-100 rounded-[32px] p-8 shadow-sm">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Informações Pessoais</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">E-mail da Conta</label>
                  <input 
                    type="email" 
                    disabled
                    value={email}
                    className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">Boltz ID (Chave de Acesso)</label>
                  <div className="relative">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-400" size={16} />
                    <input 
                      type="text" 
                      disabled
                      value={shareId}
                      className="w-full pl-10 pr-12 py-3.5 bg-blue-50/30 border border-blue-100 rounded-2xl text-sm font-black text-blue-600 cursor-default"
                    />
                    <button 
                      onClick={copyId}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-600 transition-colors"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 ml-1">Nome de Exibição</label>
                <input 
                  type="text" 
                  placeholder="Seu nome"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={isLoading}
                className="bg-blue-600 text-white px-8 py-3.5 rounded-2xl text-sm font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Salvar Alterações
              </button>
            </div>
          </div>

          <div className="bg-rose-50 border border-rose-100 rounded-[32px] p-8">
            <h3 className="text-xl font-bold text-rose-900 mb-2">Zona de Perigo</h3>
            <p className="text-sm text-rose-600 font-medium mb-6">Uma vez que você deletar sua conta, não há volta. Por favor, tenha certeza.</p>
            <button className="bg-white text-rose-600 border border-rose-200 px-6 py-3 rounded-2xl text-sm font-bold hover:bg-rose-600 hover:text-white transition-all">
              Deletar Minha Conta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;