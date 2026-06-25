import React, { useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';

const data = [
  { date: '01/06', description: 'SALÁRIO', type: 'income', amount: 8400.00 },
  { date: '05/06', description: 'ALUGUEL', type: 'expense', amount: 2500.00 },
  { date: '12/06', description: 'SUPERMERCADO', type: 'expense', amount: 850.50 },
  { date: '18/06', description: 'DIVIDENDOS', type: 'income', amount: 320.00 },
  { date: '20/06', description: 'ENERGIA/NET', type: 'expense', amount: 310.20 },
];

export default function FinancialSummary() {
  const [isCompact, setIsCompact] = useState(false);

  return (
    <div className="bg-[#0a1a2f]/40 border border-[#00ffc2]/10 p-3 sm:p-4 flex flex-col flex-1 transition-all duration-300 relative overflow-hidden">
      {/* Immersive sweep scanline animation */}
      <div className="scanner-overlay-neon"></div>
      
      <div className="text-[10px] uppercase mb-3 flex items-center justify-between">
        <span className="opacity-50">Extrato Recente</span>
        <div className="flex items-center gap-3">
          <span className="text-[#00ffc2] animate-pulse hidden sm:inline-block">DATA_SYNC: OK</span>
          <button 
            onClick={() => setIsCompact(!isCompact)}
            className="text-[#00ffc2]/60 hover:text-[#00ffc2] transition-colors flex items-center gap-1 bg-[#00ffc2]/5 px-2 py-1 rounded-sm"
            title={isCompact ? "Expandir" : "Contrair"}
          >
            {isCompact ? <Maximize2 size={12} /> : <Minimize2 size={12} />}
            <span className="text-[8px] font-bold tracking-wider">{isCompact ? 'FULL' : 'COMPACT'}</span>
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-1 sm:pr-2 scrollbar-thin scrollbar-thumb-[#00ffc2]/20">
        <div className="flex flex-col space-y-1">
          {!isCompact && (
            <div className="flex justify-between border-b border-[#00ffc2]/20 text-[#00ffc2]/60 uppercase text-[9px] tracking-wider pb-2 mb-1">
              <span className="w-16">Data</span>
              <span className="flex-1">Descrição</span>
              <span className="text-right">Valor</span>
            </div>
          )}
          
          {data.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center justify-between border-b border-white/5 hover:bg-[#00ffc2]/5 transition-colors ${isCompact ? 'py-1.5' : 'py-2'}`}
            >
              {!isCompact && (
                <span className="text-[10px] text-white/50 w-16 font-mono">{item.date}</span>
              )}
              
              <div className="flex-1 flex flex-col sm:flex-row sm:items-center">
                <span className={`text-[11px] sm:text-xs text-white/90 font-mono truncate ${isCompact ? 'w-full' : ''}`}>
                  {item.description}
                </span>
                {isCompact && (
                  <span className="text-[8px] text-white/40 font-mono mt-0.5 block sm:hidden">{item.date}</span>
                )}
              </div>
              
              <span className={`text-[11px] sm:text-xs font-bold font-mono whitespace-nowrap ${item.type === 'income' ? 'text-[#00ffc2]' : 'text-[#ff0055]'}`}>
                {item.type === 'income' ? '+' : '-'} R$ {item.amount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className={`mt-2 flex justify-between items-center border-t border-[#00ffc2]/20 ${isCompact ? 'pt-2' : 'pt-3'}`}>
        <span className="text-[9px] uppercase opacity-50">Balanço Mensal</span>
        <span className={`font-bold text-[#00ffc2] font-mono ${isCompact ? 'text-xs' : 'text-sm'}`}>R$ 5.059,30</span>
      </div>
    </div>
  );
}
