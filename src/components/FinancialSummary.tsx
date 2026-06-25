import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

export default function FinancialSummary() {
  const [isCompact, setIsCompact] = useState(false);

  const [data] = useState(() => {
    const savedOnboarding = localStorage.getItem("aegis_onboarding_data");
    const onboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
    const income = onboarding ? parseFloat(onboarding.income) || 5000 : 5000;

    return [
      { date: '01/06', description: 'SALÁRIO', type: 'income', amount: income },
      { date: '05/06', description: 'ALUGUEL', type: 'expense', amount: income * 0.2976 }, // proportional to 2500/8400
      { date: '12/06', description: 'SUPERMERCADO', type: 'expense', amount: income * 0.10125 }, // proportional to 850.5/8400
      { date: '18/06', description: 'DIVIDENDOS', type: 'income', amount: income * 0.038 }, // proportional to 320/8400
      { date: '20/06', description: 'ENERGIA/NET', type: 'expense', amount: income * 0.0369 }, // proportional to 310.2/8400
    ];
  });

  const totalIncome = data.filter(item => item.type === 'income').reduce((acc, item) => acc + item.amount, 0);
  const totalExpense = data.filter(item => item.type === 'expense').reduce((acc, item) => acc + item.amount, 0);
  const monthlyBalance = totalIncome - totalExpense;

  return (
    <div className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/10 p-3 sm:p-4 flex flex-col flex-1 transition-all duration-300 relative overflow-hidden">
      {/* Immersive sweep scanline animation */}
      <div className="scanner-overlay-neon"></div>
      
      <div className="text-base uppercase mb-3 flex items-center justify-between">
        <span className="opacity-50">Extrato Recente</span>
        <div className="flex items-center gap-3">
          <span className="text-[var(--theme-color)] animate-pulse hidden sm:inline-block">DATA_SYNC: OK</span>
          <button 
            onClick={() => setIsCompact(!isCompact)}
            className="text-[var(--theme-color)]/60 hover:text-[var(--theme-color)] transition-colors flex items-center gap-1 bg-[var(--theme-color)]/5 px-2 py-1 rounded-sm"
            title={isCompact ? "Expandir" : "Contrair"}
          >
            {isCompact ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            <span className="text-base font-bold tracking-wider">{isCompact ? 'FULL' : 'COMPACT'}</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-[var(--theme-color)]/20">
        <div className="flex flex-col space-y-1">
          {!isCompact && (
            <div className="flex justify-between border-b border-[var(--theme-color)]/20 text-[var(--theme-color)]/60 uppercase text-base tracking-wider pb-2 mb-1">
              <span className="w-16">Data</span>
              <span className="flex-1">Descrição</span>
              <span className="text-right">Valor</span>
            </div>
          )}
          
          {data.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between border-b border-white/5 hover:bg-[var(--theme-color)]/5 transition-colors ${isCompact ? 'py-1.5' : 'py-2'}`}
            >
              {!isCompact && (
                <span className="text-base text-white/50 w-16 font-mono">{item.date}</span>
              )}
              
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
                <span className={`text-base sm:text-base text-white/90 font-mono truncate ${isCompact ? 'w-full' : ''}`}>
                  {item.description}
                </span>
                {isCompact && (
                  <span className="text-base text-white/40 font-mono mt-0.5 block sm:hidden">{item.date}</span>
                )}
              </div>
              
              <span className={`text-base sm:text-base font-bold font-mono whitespace-nowrap ${item.type === 'income' ? 'text-[var(--theme-color)]' : 'text-[#ff0055]'}`}>
                {item.type === 'income' ? '+' : '-'} R$ {item.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`mt-2 flex justify-between items-center border-t border-[var(--theme-color)]/20 ${isCompact ? 'pt-2' : 'pt-3'}`}>
        <span className="text-base uppercase opacity-50">Balanço Mensal</span>
        <span className={`font-bold text-[var(--theme-color)] font-mono ${isCompact ? 'text-xs' : 'text-sm'}`}>
          R$ {monthlyBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
    </div>
  );
}
