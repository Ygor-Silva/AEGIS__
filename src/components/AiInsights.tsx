import React, { useState, useEffect } from 'react';
import { BrainCircuit, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const insights = [
  "Ei, operador. Notei que os gastos com delivery subiram 30% esta semana. Que tal ativarmos o 'modo chef' hoje para mantermos a meta no verde?",
  "Análise concluída, parceiro: aquelas duas assinaturas de streaming que você não usa há meses estão drenando a liquidez. Posso cancelar para você?",
  "Belo trabalho mantendo as contas fixas na linha! Mas atenção ao setor de lazer, estamos chegando perto do teto estabelecido para o mês.",
  "Estive projetando o seu fluxo de caixa... Se a gente reduzir 15% das compras não essenciais, a sua reserva de emergência atinge o objetivo 2 meses antes do previsto. Vamos nessa?",
];

export default function AiInsights() {
  const [currentInsight, setCurrentInsight] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentInsight((prev) => (prev + 1) % insights.length);
        setIsVisible(true);
      }, 500); // Wait for fade out before changing and fading in
    }, 15000); // Change insight every 15 seconds

    return () => clearInterval(interval);
  }, []);

  if (!isVisible && currentInsight === -1) return null; // Just for initial mount safety

  return (
    <div className="bg-[#0a1a2f]/60 border border-[#b000ff]/30 p-4 relative overflow-hidden backdrop-blur-sm group">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-[#b000ff] to-transparent opacity-50"></div>
      
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <BrainCircuit size={14} className="text-[#b000ff] animate-pulse" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#b000ff]">Insights de A.E.G.I.S.</span>
        </div>
        <button 
          onClick={() => setIsVisible(false)} 
          className="text-[#b000ff]/50 hover:text-[#b000ff] transition-colors"
        >
        </button>
      </div>

      <div className="min-h-[60px] flex items-center">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key={currentInsight}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="text-xs text-white/80 leading-relaxed font-sans"
            >
              <span className="text-[#b000ff] font-bold mr-1">&gt;</span>
              {insights[currentInsight]}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b border-r border-[#b000ff]/30 m-1"></div>
    </div>
  );
}
