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
  Github,
  Circle
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#110935] text-white selection:bg-[#79F791] selection:text-[#110935] overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#110935]/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#29A858] rounded-2xl flex items-center justify-center shadow-lg shadow-[#29A858]/20">
              <LayoutGrid className="text-[#110935]" size={24} strokeWidth={3} />
            </div>
            <span className="text-2xl font-black tracking-tighter">boltz.</span>
          </div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-bold">
            <a href="#features" className="hover:text-[#79F791] transition-colors">Recursos</a>
            <a href="#about" className="hover:text-[#79F791] transition-colors">Sobre</a>
            <button 
              onClick={() => navigate('/app')}
              className="bg-[#29A858] text-[#110935] px-8 py-3.5 rounded-full hover:bg-[#79F791] transition-all active:scale-95 font-black"
            >
              Entrar no App
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-52 pb-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[#79F791] text-xs font-black uppercase tracking-widest mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} />
            O futuro dos mapas mentais
          </div>
          
          <h1 className="text-7xl md:text-[140px] font-black tracking-tighter leading-[0.85] mb-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Better <br />
            <span className="relative inline-block">
              Business
              <svg className="absolute -bottom-2 left-0 w-full h-4 text-[#79F791] opacity-60" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="4" />
              </svg>
            </span> <br />
            <span className="text-[#29A858]">Mapping.</span>
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-end">
            <p className="text-2xl text-white/60 font-medium leading-tight max-w-md animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              At Boltz we live and breathe responsibility and care. Organize your ideas with professional precision.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
              <button 
                onClick={() => navigate('/app')}
                className="group bg-[#29A858] text-[#110935] px-12 py-6 rounded-2xl text-xl font-black hover:bg-[#79F791] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 shadow-2xl shadow-[#29A858]/20"
              >
                getboltz.com
                <ArrowRight className="group-hover:translate-x-1 transition-transform" strokeWidth={3} />
              </button>
              <button className="text-lg font-bold text-white/40 hover:text-white transition-all">
                Ver Demonstração
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section className="px-6 pb-40">
        <div className="max-w-7xl mx-auto relative">
          <div className="absolute -inset-10 bg-[#29A858] rounded-[60px] blur-[120px] opacity-10 animate-pulse" />
          <div className="relative bg-[#1a1a4e] border border-white/10 rounded-[48px] shadow-2xl overflow-hidden aspect-video group">
            <div className="absolute inset-0 bg-gradient-to-br from-[#29A858]/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="flex flex-col items-center gap-6 text-white/10">
                <LayoutGrid size={120} strokeWidth={0.5} />
                <span className="font-black uppercase tracking-[0.3em] text-sm">Visual Workspace</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-40 bg-white text-[#110935]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-32 max-w-3xl">
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-12">
              Designed for <br />
              <span className="scribble-circle inline-block px-4">Modern</span> Teams.
            </h2>
            <p className="text-2xl text-[#110935]/60 font-medium">
              We are a business that is sustainable not only for us, but for all of society and our environment.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-20">
            <FeatureCard 
              icon={Zap} 
              title="Ingenuity" 
              desc="Crie fluxos complexos com a simplicidade de um clique. Nossa engine é otimizada para performance extrema."
              color="bg-[#79F791]"
            />
            <FeatureCard 
              icon={Shield} 
              title="Trust" 
              desc="Seus dados são criptografados e protegidos. Privacidade não é um recurso, é o nosso fundamento."
              color="bg-[#AC7FFF]"
            />
            <FeatureCard 
              icon={MousePointer2} 
              title="Simplicity" 
              desc="Interface limpa, sem distrações. Focamos no que importa: a clareza das suas ideias."
              color="bg-[#E6E7E8]"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <LayoutGrid className="text-white" size={20} strokeWidth={3} />
            </div>
            <span className="text-xl font-black tracking-tighter">boltz.</span>
          </div>
          
          <p className="text-sm font-bold text-white/20">
            © 2024 Boltz Map. All rights reserved.
          </p>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-white/20 hover:text-[#79F791] transition-colors">
              <Github size={24} />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <div className="space-y-8 group">
    <div className={cn("w-20 h-20 rounded-[32px] flex items-center justify-center transition-transform group-hover:scale-110 duration-500", color)}>
      <Icon size={32} className="text-[#110935]" strokeWidth={2.5} />
    </div>
    <div className="space-y-4">
      <h3 className="text-3xl font-black tracking-tight">{title}</h3>
      <p className="text-lg text-[#110935]/50 font-medium leading-snug">{desc}</p>
    </div>
  </div>
);

export default Landing;