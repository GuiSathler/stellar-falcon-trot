"use client";

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { LayoutGrid, Mail, Lock, ArrowRight, Loader2, Phone, AlertTriangle } from 'lucide-react';
import { showError, showSuccess } from '@/utils/toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [attemptedAuth, setAttemptedAuth] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedAuth(true);
    
    if (!isSupabaseConfigured) {
      showError("Configuração do Supabase ausente. Conecte o projeto primeiro.");
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        showSuccess("Bem-vindo de volta!");
        navigate('/app');
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              phone_number: phone,
            }
          }
        });
        
        if (error) throw error;

        if (data.user && data.session) {
          showSuccess("Conta criada com sucesso!");
          navigate('/app');
        } else {
          showSuccess("Verifique seu e-mail para confirmar o cadastro.");
          setIsLogin(true);
        }
      }
    } catch (error: any) {
      console.error("Erro de Auth:", error);
      showError(error.message || "Erro na comunicação com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {attemptedAuth && !isSupabaseConfigured && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-start gap-3 text-amber-800 text-sm font-medium mb-6 animate-in fade-in zoom-in duration-300">
            <AlertTriangle className="shrink-0 text-amber-500" size={20} />
            <p>O Supabase não está conectado. Clique no botão de integração para configurar as chaves e depois use o botão Rebuild.</p>
          </div>
        )}

        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-xl shadow-blue-100 mb-6">
            <LayoutGrid className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </h1>
          <p className="text-gray-500 mt-2 font-medium">
            {isLogin ? "Continue seus projetos no Boltz Flow" : "Comece a organizar suas ideias hoje"}
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">E-mail</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          {!isLogin && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <label className="text-sm font-bold text-gray-700 ml-1">Telefone</label>
              <div className="relative group">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="tel" 
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 ml-1">Senha</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:ring-4 focus:ring-blue-50/50 focus:bg-white focus:border-blue-200 outline-none transition-all"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl text-sm font-bold hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : (
              <>
                {isLogin ? "Entrar" : "Cadastrar"}
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setAttemptedAuth(false);
            }}
            className="text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors"
          >
            {isLogin ? "Não tem uma conta? Cadastre-se" : "Já tem uma conta? Entre aqui"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;