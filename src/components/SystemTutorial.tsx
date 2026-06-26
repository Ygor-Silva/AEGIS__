import React, { useState, useEffect } from 'react';
import { Shield, ChevronRight, ChevronLeft, Terminal, Sparkles, User, Target, BarChart2, MessageSquare, BrainCircuit, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TutorialStep {
  title: string;
  description: string;
  highlightText: string;
  icon: React.ElementType;
}

interface SystemTutorialProps {
  onClose: () => void;
}

export default function SystemTutorial({ onClose }: SystemTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [userData, setUserData] = useState<any>(null);
  const [isBooting, setIsBooting] = useState(true);
  const [bootLog, setBootLog] = useState<string[]>([]);

  useEffect(() => {
    const savedOnboarding = localStorage.getItem("kerdos_onboarding_data");
    if (savedOnboarding) {
      try {
        setUserData(JSON.parse(savedOnboarding));
      } catch (e) {}
    }

    // Simulate custom system boot sequence
    const logs = [
      "> INICIANDO KERNEL DO KERDOS...",
      "> AUTENTICANDO OPERADOR...",
      "> ANALISANDO PERFIL FINANCEIRO...",
      "> CALIBRANDO MÓDULO DE METAS...",
      "> SINCRONIZANDO REDE NEURAL...",
      "> AMBIENTE PERSONALIZADO PRONTO."
    ];
    
    let currentLog = 0;
    const interval = setInterval(() => {
      setBootLog(prev => [...prev, logs[currentLog]]);
      currentLog++;
      if (currentLog >= logs.length) {
        clearInterval(interval);
        setTimeout(() => setIsBooting(false), 1000);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  const getGoalName = (goalValue: string) => {
    switch (goalValue) {
      case 'imovel': return 'a compra do seu imóvel';
      case 'aposentadoria': return 'sua independência financeira';
      case 'viagem': return 'sua viagem dos sonhos';
      case 'investimentos': return 'a maximização de seus investimentos';
      default: return 'a sua reserva de emergência';
    }
  };

  const userName = userData?.name || "Operador";
  const userGoal = getGoalName(userData?.goal);

  const steps: TutorialStep[] = [
    {
      title: "INICIALIZAÇÃO DO SISTEMA KERDOS",
      description: `Olá, ${userName}. Eu sou KERDOS, seu sistema avançado de inteligência financeira. Meu protocolo principal é processar seus dados e garantir que você alcance ${userGoal} no menor tempo possível. O ambiente foi otimizado para o seu perfil.`,
      highlightText: "BEM-VINDO AO TERMINAL",
      icon: Terminal
    },
    {
      title: "VISÃO GERAL DO PATRIMÔNIO",
      description: "No seu Smart Dashboard central, você possui uma visão consolidada e em tempo real do seu patrimônio. Monitoramos suas metas ativas, tendências de gastos e oferecemos um panorama preditivo da sua saúde financeira.",
      highlightText: "SMART DASHBOARD",
      icon: BarChart2
    },
    {
      title: "REDES NEURAIS DE INSIGHTS",
      description: "Opero 24/7 analisando seus padrões. A seção de Inteligência Financeira e Insights AI gerará relatórios automáticos sobre onde você pode economizar e como alocar melhor seus recursos para otimizar ganhos.",
      highlightText: "PROCESSAMENTO PREDITIVO",
      icon: BrainCircuit
    },
    {
      title: "LANÇAMENTOS VIA CHATBOT",
      description: "Esqueça formulários complexos. Para registrar uma despesa ou receita, basta me avisar pelo Chat no terminal esquerdo: 'Gastei 50 no almoço'. Eu classifico, categorizo e atualizo seu painel automaticamente.",
      highlightText: "PROCESSAMENTO DE LINGUAGEM NATURAL",
      icon: MessageSquare
    },
    {
      title: "SISTEMA DE RECOMPENSAS",
      description: "A disciplina gera resultados. Conforme você mantém o saldo positivo e atinge seus objetivos, você desbloqueará conquistas (Achievements). Sua dedicação será sempre quantificada e recompensada.",
      highlightText: "GAMIFICAÇÃO DE METAS",
      icon: Target
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      localStorage.setItem("kerdos_tutorial_complete", "true");
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("kerdos_tutorial_complete", "true");
    onClose();
  };

  if (isBooting) {
    return (
      <div className="fixed inset-0 z-[160] bg-[#020408]/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-black/50 border border-[var(--theme-color)]/30 rounded-xl p-8 font-mono shadow-[0_0_50px_rgba(0,255,194,0.1)]">
          <div className="flex items-center gap-3 mb-6 border-b border-[var(--theme-color)]/20 pb-4">
            <Shield className="text-[var(--theme-color)] animate-pulse" size={24} />
            <h2 className="text-[var(--theme-color)] text-xl font-bold tracking-widest uppercase">KERDOS OS v1.0</h2>
          </div>
          <div className="space-y-3">
            {bootLog.map((log, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2 text-sm text-white/70"
              >
                <CheckCircle2 size={14} className="text-[var(--theme-color)]" />
                {log}
              </motion.div>
            ))}
            <div className="h-4 flex items-center">
              <div className="w-2 h-4 bg-[var(--theme-color)] animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const current = steps[currentStep];
  const StepIcon = current.icon;

  return (
    <div className="fixed inset-0 z-[160] bg-[#020408]/90 backdrop-blur-xl flex items-center justify-center p-4">
      {/* Background ambient light */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--theme-color)]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        key={currentStep}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="bg-[#0a1a2f]/80 border border-[var(--theme-color)]/40 max-w-2xl w-full relative overflow-hidden rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_0_0_1px_rgba(255,255,255,0.05)] font-mono"
      >
        {/* Neon scan overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--theme-color)]/5 to-transparent opacity-30 pointer-events-none"></div>

        {/* Top telemetry bar */}
        <div className="bg-black/40 border-b border-[var(--theme-color)]/20 px-6 py-4 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[var(--theme-color)]/20 rounded-md border border-[var(--theme-color)]/30">
              <Shield className="text-[var(--theme-color)] animate-pulse" size={18} />
            </div>
            <span className="text-sm uppercase font-bold tracking-widest text-white/90">TOUR GUIADO KERDOS</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5 mr-4">
              {steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentStep ? 'w-8 bg-[var(--theme-color)] shadow-[0_0_10px_var(--theme-color)]' : 'w-2 bg-white/20'}`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-[var(--theme-color)]/70 bg-[var(--theme-color)]/10 px-2 py-1 rounded border border-[var(--theme-color)]/20">
              {currentStep + 1} / {steps.length}
            </span>
          </div>
        </div>

        {/* Steps Content */}
        <div className="p-8 md:p-10 space-y-6 flex flex-col md:flex-row gap-8 items-center">
          <div className="shrink-0 relative">
            <div className="absolute inset-0 bg-[var(--theme-color)] opacity-20 blur-2xl rounded-full"></div>
            <div className="w-24 h-24 md:w-32 md:h-32 bg-black/50 border border-[var(--theme-color)]/40 rounded-full flex items-center justify-center relative z-10 shadow-[inset_0_0_20px_rgba(0,255,194,0.1)]">
              <StepIcon size={48} className="text-[var(--theme-color)]" />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/30 rounded-full text-xs text-[var(--theme-color)] font-bold tracking-widest uppercase">
              <Sparkles size={12} />
              {current.highlightText}
            </div>

            <h2 className="text-white font-black text-xl md:text-2xl tracking-wide uppercase drop-shadow-[0_2px_10px_rgba(0,0,0,1)]">
              {current.title}
            </h2>

            <p className="text-sm md:text-base text-white/70 leading-relaxed font-sans min-h-[80px]">
              {current.description}
            </p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-black/30 px-6 py-5 flex flex-col sm:flex-row items-center justify-between border-t border-[var(--theme-color)]/10 gap-4 sm:gap-0">
          <button 
            onClick={handleSkip} 
            className="text-xs text-white/40 hover:text-white transition-colors cursor-pointer uppercase font-bold tracking-widest hover:bg-white/5 px-3 py-2 rounded-md"
          >
            PULAR TOUR
          </button>

          <div className="flex gap-3 w-full sm:w-auto">
            {currentStep > 0 && (
              <button 
                onClick={handlePrev}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-[var(--theme-color)]/30 text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 transition-all flex items-center justify-center gap-2 text-xs font-bold tracking-widest cursor-pointer"
              >
                <ChevronLeft size={14} /> VOLTAR
              </button>
            )}

            <button 
              onClick={handleNext}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-[var(--theme-color)] text-black hover:bg-white transition-all flex items-center justify-center gap-2 text-xs font-black tracking-widest cursor-pointer shadow-[0_0_15px_var(--theme-color)]"
            >
              {currentStep === steps.length - 1 ? "INICIAR SISTEMA" : "PRÓXIMO"} 
              {currentStep === steps.length - 1 ? <Shield size={14} /> : <ChevronRight size={14} />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

