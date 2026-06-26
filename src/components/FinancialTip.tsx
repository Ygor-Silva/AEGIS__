import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingDown, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TIPS = [
  {
    id: 1,
    title: "Otimização de Assinaturas",
    text: "Notamos múltiplos serviços de streaming no seu histórico recente. Considere revisar quais você realmente usa para economizar até 15% ao mês.",
    icon: TrendingDown,
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30"
  },
  {
    id: 2,
    title: "Alerta de Gastos com Alimentação",
    text: "Seus gastos com delivery estão 20% acima da média das últimas semanas. Que tal planejar refeições em casa para equilibrar o orçamento?",
    icon: ShieldAlert,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/30"
  },
  {
    id: 3,
    title: "Potencial de Investimento",
    text: "Você manteve seus gastos fixos baixos este mês! Há uma sobra prevista no caixa. Considere direcionar esse valor para sua Reserva de Emergência.",
    icon: TrendingUp,
    color: "text-[var(--theme-color)]",
    bg: "bg-[var(--theme-color)]/10",
    border: "border-[var(--theme-color)]/30"
  },
  {
    id: 4,
    title: "Cashback Não Utilizado",
    text: "Identificamos compras recentes em lojas parceiras. Lembre-se de ativar sistemas de cashback para recuperar parte do valor investido.",
    icon: Sparkles,
    color: "text-[#b000ff]",
    bg: "bg-[#b000ff]/10",
    border: "border-[#b000ff]/30"
  }
];

export default function FinancialTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Alterna a dica a cada 15 segundos para dar tempo de ler e demonstrar a variação
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const tip = TIPS[currentTipIndex];
  const Icon = tip.icon;

  return (
    <div className="bg-[#0a1a2f]/60 border border-[var(--theme-color)]/30 rounded-xl flex flex-col h-full overflow-hidden backdrop-blur-md relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--theme-color)] to-transparent opacity-50"></div>
      
      <div className="px-4 py-3 border-b border-[var(--theme-color)]/20 flex items-center gap-2 bg-[var(--theme-color)]/5 shrink-0">
        <Lightbulb size={18} className="text-[var(--theme-color)]" />
        <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider">
          Inteligência Financeira
        </h3>
      </div>

      <div className="flex-1 p-5 flex flex-col justify-center relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={tip.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
            className={`flex flex-col h-full justify-center p-4 rounded-lg border ${tip.bg} ${tip.border}`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-full bg-black/40 ${tip.color}`}>
                <Icon size={20} />
              </div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${tip.color}`}>
                {tip.title}
              </h4>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              {tip.text}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>
      
      <div className="px-4 py-3 border-t border-[var(--theme-color)]/10 bg-black/40 flex justify-between items-center shrink-0">
        <div className="flex gap-1.5">
          {TIPS.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentTipIndex ? 'w-4 bg-[var(--theme-color)]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
          KERDOS AUTO-SCAN
        </span>
      </div>
    </div>
  );
}
