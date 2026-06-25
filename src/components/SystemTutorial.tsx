import React, { useState } from 'react';
import { Shield, ChevronRight, ChevronLeft, Terminal, Sparkles, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TutorialStep {
  title: string;
  description: string;
  target?: string; // Informational anchor reference
  highlightText: string;
}

interface SystemTutorialProps {
  onClose: () => void;
}

export default function SystemTutorial({ onClose }: SystemTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps: TutorialStep[] = [
    {
      title: "CONEXÃO ESTABELECIDA",
      description: "Olá, Operador. Eu sou a A.E.G.I.S., seu Assistente Especializado de Gestão e Inteligência de Saldos. Meu objetivo é guiar sua jornada de consolidação patrimonial através de análise preditiva de rede.",
      highlightText: "BEM-VINDO AO TERMINAL PRINCIPAL"
    },
    {
      title: "BÓBULA DE CAPITAL E METAS",
      description: "No topo do painel esquerdo, você monitora seu patrimônio total integrado. Abaixo dele, criamos barras neon dinâmicas para rastrear metas específicas, como sua Reserva de Emergência ou Fundos de Viagem.",
      highlightText: "PATRIMÔNIO & PROGRESSO DE METAS"
    },
    {
      title: "REGISTRO DE OPERAÇÕES",
      description: "O Extrato Recente fornece uma cópia limpa e auditável dos seus fluxos de fundos. Você pode compactar ou expandir o extrato conforme necessário usando o link superior.",
      highlightText: "FLUXO DE TRANSAÇÕES RECENTES"
    },
    {
      title: "ANÁLISE DE TENDÊNCIA DE CAIXA",
      description: "Redesenhamos o gráfico Spending Trend! Agora ele opera como um gráfico de Área, fornecendo total clareza visual de suas entradas vs. despesas. Você pode usar os filtros rápidos de cabeçalho para isolar dados ou analisar a Taxa de Poupança.",
      highlightText: "SISTEMA DE GRÁFICO RECONSTRUÍDO"
    },
    {
      title: "REDE COGNITIVA DE INSIGHTS",
      description: "No canto superior direito, meu processador analisa continuamente seus hábitos em segundo plano e gera alertas e conselhos no tom de um amigo próximo e parceiro estratégico.",
      highlightText: "ALERTA COGNITIVO & INSIGHTS DE IA"
    },
    {
      title: "LANÇAMENTO COM AUTO-SUGESTÃO",
      description: "Insira novas despesas rapidamente. Ao digitar a descrição do lançamento, minha rede neural de processamento de linguagem natural sugere instantaneamente a categoria apropriada sem que você precise preencher manualmente.",
      highlightText: "MÓDULO DE DE LANÇAMENTO INTELIGENTE"
    },
    {
      title: "TERMINAL DE ACÕES RÁPIDAS",
      description: "O escudo flutuante no canto inferior direito abre um canal de controle seguro. Use-o para alterar calibrações de assessoramento, exportar relatórios formatados em PDF ou desconectar com segurança.",
      highlightText: "AÇÕES DE SEGURANÇA E RELATÓRIO"
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("aegis_tutorial_complete", "true");
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("aegis_tutorial_complete", "true");
    onClose();
  };

  const current = steps[currentStep];

  return (
    <div className="fixed inset-0 z-[160] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#020408] border-2 border-[var(--theme-color)] max-w-lg w-full relative overflow-hidden shadow-[0_0_40px_rgba(0,255,194,0.3)] font-mono"
      >
        {/* Neon scan overlays */}
        <div className="scanner-overlay-neon opacity-20"></div>

        {/* Framing borders */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--theme-color)]" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[var(--theme-color)]" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[var(--theme-color)]" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--theme-color)]" />

        {/* Top telemetry bar */}
        <div className="bg-[#0a1a2f] border-b border-[var(--theme-color)]/30 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="text-[var(--theme-color)] animate-pulse" size={16} />
            <span className="text-base uppercase font-bold tracking-widest text-[var(--theme-color)]">CALIBRAÇÃO DE COGNIÇÃO HUD</span>
          </div>
          <span className="text-base text-[var(--theme-color)]/50">PASSO_0{currentStep + 1} / 0{steps.length}</span>
        </div>

        {/* Steps Content */}
        <div className="p-6 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/30 text-base text-[var(--theme-color)] tracking-wider uppercase">
            <Sparkles size={10} />
            {current.highlightText}
          </div>

          <h2 className="text-[var(--theme-color)] font-black text-lg tracking-widest uppercase">
            {current.title}
          </h2>

          <p className="text-base text-white/80 leading-relaxed font-sans min-h-[90px]">
            {current.description}
          </p>

          {/* Visual indicator lines */}
          <div className="flex items-center gap-1.5 py-2">
            {steps.map((_, idx) => (
              <div 
                key={idx} 
                className={`h-1.5 transition-all duration-300 ${idx === currentStep ? 'w-8 bg-[var(--theme-color)]' : 'w-2 bg-[var(--theme-color)]/20'}`}
              />
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <button 
              onClick={handleSkip} 
              className="text-base text-white/40 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-widest"
            >
              PULAR_INTRO
            </button>

            <div className="flex gap-2">
              {currentStep > 0 && (
                <button 
                  onClick={handlePrev}
                  className="px-3 py-2 border border-[var(--theme-color)]/30 text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 transition-all flex items-center gap-1 text-base font-bold tracking-widest cursor-pointer"
                >
                  <ChevronLeft size={12} /> VOLTAR
                </button>
              )}

              <button 
                onClick={handleNext}
                className="px-4 py-2 bg-[var(--theme-color)]/20 border border-[var(--theme-color)] text-[var(--theme-color)] hover:bg-[var(--theme-color)] hover:text-black transition-all flex items-center gap-1 text-base font-bold tracking-widest cursor-pointer"
              >
                {currentStep === steps.length - 1 ? "ENTRADA" : "PRÓXIMO"} <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
