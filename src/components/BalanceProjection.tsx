import React from 'react';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export default function BalanceProjection() {
  const currentBalance = 5059.30;
  const projectedExpenses = 1250.00; // Estimated future recurring
  const projectedBalance = currentBalance - projectedExpenses;
  const isHealthy = projectedBalance > 2000;

  return (
    <div className="bg-[#0a1a2f]/40 border border-[#00ffc2]/10 p-3 flex flex-col mt-4">
      <div className="text-[10px] uppercase opacity-50 mb-3 flex items-center gap-2">
        <AlertCircle size={12} className="text-[#00ffc2]" />
        Projeção de Saldo Mensal
      </div>
      
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-[8px] text-white/40 uppercase mb-1">Saldo Atual</div>
          <div className="text-sm font-mono">R$ {currentBalance.toFixed(2)}</div>
        </div>
        <div className="text-right">
          <div className="text-[8px] text-white/40 uppercase mb-1">Saídas Previstas</div>
          <div className="text-sm font-mono text-[#ff0055]">- R$ {projectedExpenses.toFixed(2)}</div>
        </div>
      </div>

      <div className={`p-2 border ${isHealthy ? 'bg-[#00ffc2]/5 border-[#00ffc2]/30 text-[#00ffc2]' : 'bg-orange-500/5 border-orange-500/30 text-orange-500'} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {isHealthy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <div className="flex flex-col">
            <span className="text-[8px] uppercase font-bold tracking-wider opacity-80">Estimativa Fim do Mês</span>
            <span className="text-xs font-mono font-bold">R$ {projectedBalance.toFixed(2)}</span>
          </div>
        </div>
        <div className="text-[9px] uppercase tracking-wider opacity-70">
          {isHealthy ? 'ESTÁVEL' : 'ALERTA'}
        </div>
      </div>
    </div>
  );
}
