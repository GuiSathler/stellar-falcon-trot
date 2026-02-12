"use client";

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutGrid, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Shield, 
  MousePointer2,
  Github
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
              <LayoutGrid className="text-white" size={22} />
            </div>
            <span className="text-xl font-black tracking-tight">Boltz Flow</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-500">
            <a href="#features" className="hover:text-blue-600 transition-colors">Recursos</a>
            <a href="#about" className="hover:text-blue-600 transition-colors">Sobre</a>
            <button 
              onClick={() => navigate('/app')}
              className="bg-gray-900 text-white px-6 py-2.5 rounded-full hover:bg-blue-600 transition-all active:scale-95"
            >
              Entrar no App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} />
            O futuro dos mapas mentais chegou
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Transforme ideias em <span className="text-blue-600">fluxos visuais</span>.
          </h1>
          
          <p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            A ferramenta definitiva para organizar pensamentos, planejar projetos e colaborar em tempo real com uma interface intuitiva e poderosa.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <button 
              onClick={() => navigate('/app')}
              className="group bg-blue-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-2xl shadow-blue-200"
            >
              Começar Agora Grátis
              <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-5 rounded-2xl text-lg font-bold text-gray-600 hover:bg-gray-50 transition-all">
              Ver Demonstração
            </button>
          </div>
        </div>
      </section>

      {/* Preview Image / Mockup */}
      <section className="px-6 pb-32">
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-[40px] blur-3xl opacity-10 animate-pulse" />
          <div className="relative bg-white border border-gray-100 rounded-[32px] shadow-2xl overflow-hidden aspect-video group">
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4 text-gray-300">
                <LayoutGrid size={80} strokeWidth={1} />
                <span className="font-bold uppercase tracking-widest text-sm">Visualização do Workspace</span>
              </div>
            </div>
            {/* Overlay Gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60" />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-6">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold">Velocidade Boltz</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Crie nós e conexões instantaneamente com atalhos inteligentes e uma engine de renderização ultra-rápida.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <MousePointer2 size={28} />
              </div>
              <h3 className="text-2xl font-bold">Interatividade Total</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Seleção por área estilo desktop, drag-and-drop fluido e organização automática com um clique.
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Shield size={28} />
              </div>
              <h3 className="text-2xl font-bold">Segurança & Backup</h3>
              <p className="text-gray-500 font-medium leading-relaxed">
                Seus dados são salvos localmente e podem ser exportados em JSON a qualquer momento para total controle.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5 opacity-50 grayscale">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <LayoutGrid className="text-white" size={16} />
            </div>
            <span className="text-lg font-black tracking-tight">Boltz Flow</span>
          </div>
          
          <p className="text-sm font-medium text-gray-400">
            © 2024 Boltz Flow. Todos os direitos reservados.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-colors">
              <Github size={20} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;