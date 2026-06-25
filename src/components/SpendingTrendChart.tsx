import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, Percent, Filter } from 'lucide-react';

export default function SpendingTrendChart() {
  const [filter, setFilter] = useState<'both' | 'income' | 'expense'>('both');

  const [data] = useState(() => {
    const savedOnboarding = localStorage.getItem("aegis_onboarding_data");
    const onboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
    const income = onboarding ? parseFloat(onboarding.income) || 5000 : 5000;

    // Generate highly realistic, proportional historical telemetry data
    return [
      { name: 'JAN', despesas: Math.round(income * 0.476), receitas: Math.round(income * 1.0), saldo: Math.round(income * 0.524) },
      { name: 'FEV', despesas: Math.round(income * 0.357), receitas: Math.round(income * 0.999), saldo: Math.round(income * 0.642) },
      { name: 'MAR', despesas: Math.round(income * 0.595), receitas: Math.round(income * 1.166), saldo: Math.round(income * 0.571) },
      { name: 'ABR', despesas: Math.round(income * 0.330), receitas: Math.round(income * 1.060), saldo: Math.round(income * 0.730) },
      { name: 'MAI', despesas: Math.round(income * 0.225), receitas: Math.round(income * 1.047), saldo: Math.round(income * 0.822) },
      { name: 'JUN', despesas: Math.round(income * 0.284), receitas: Math.round(income * 1.047), saldo: Math.round(income * 0.763) },
    ];
  });

  // Calculate stats to make the dashboard highly professional and clear
  const avgIncome = data.reduce((sum, item) => sum + item.receitas, 0) / data.length;
  const avgExpenses = data.reduce((sum, item) => sum + item.despesas, 0) / data.length;
  const savingsRate = Math.round(((avgIncome - avgExpenses) / avgIncome) * 100);

  return (
    <div className="flex-1 bg-[#0a1a2f]/40 border border-[#00ffc2]/10 p-3 sm:p-4 flex flex-col min-h-[260px] relative overflow-hidden transition-all duration-300">
      {/* Laser sweeping scanline animation */}
      <div className="scanner-overlay-magenta"></div>

      {/* Card Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-[#00ffc2]" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#00ffc2]">Tendência de Caixa</span>
        </div>

        {/* Quick Filter Controls */}
        <div className="flex items-center gap-1">
          <Filter size={10} className="text-[#00ffc2]/40 mr-1" />
          <button 
            onClick={() => setFilter('both')} 
            className={`px-1.5 py-0.5 text-[8px] font-mono border tracking-tighter transition-all cursor-pointer ${filter === 'both' ? 'border-[#00ffc2] bg-[#00ffc2]/10 text-[#00ffc2]' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            GERAL
          </button>
          <button 
            onClick={() => setFilter('income')} 
            className={`px-1.5 py-0.5 text-[8px] font-mono border tracking-tighter transition-all cursor-pointer ${filter === 'income' ? 'border-[#00d4ff] bg-[#00d4ff]/10 text-[#00d4ff]' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            ENTRADAS
          </button>
          <button 
            onClick={() => setFilter('expense')} 
            className={`px-1.5 py-0.5 text-[8px] font-mono border tracking-tighter transition-all cursor-pointer ${filter === 'expense' ? 'border-[#ff0055] bg-[#ff0055]/10 text-[#ff0055]' : 'border-white/10 text-white/50 hover:text-white'}`}
          >
            SAÍDAS
          </button>
        </div>
      </div>

      {/* Explanatory telemetry bar - removes all confusion */}
      <div className="grid grid-cols-3 gap-1 mb-4 bg-black/40 border border-white/5 p-2 text-center">
        <div>
          <div className="text-[7px] text-white/40 uppercase">Média Mensal Entradas</div>
          <div className="text-[11px] font-mono font-bold text-[#00d4ff]">R$ {avgIncome.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-[7px] text-white/40 uppercase">Média Mensal Saídas</div>
          <div className="text-[11px] font-mono font-bold text-[#ff0055]">R$ {avgExpenses.toFixed(0)}</div>
        </div>
        <div>
          <div className="text-[7px] text-white/40 uppercase flex items-center justify-center gap-0.5">
            <Percent size={8} /> Taxa Poupança
          </div>
          <div className="text-[11px] font-mono font-bold text-[#00ffc2]">{savingsRate}%</div>
        </div>
      </div>

      {/* Main Chart Stage */}
      <div className="flex-1 w-full h-full min-h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceitas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorDespesas" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff0055" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#ff0055" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#00ffc2" opacity={0.05} />
            <XAxis 
              dataKey="name" 
              stroke="#00ffc2" 
              opacity={0.4} 
              fontSize={8} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              stroke="#00ffc2" 
              opacity={0.4} 
              fontSize={8} 
              tickLine={false} 
              axisLine={false} 
              tickFormatter={(value) => `R$${value}`}
            />
            <Tooltip
              contentStyle={{ 
                backgroundColor: '#020408', 
                borderColor: '#00ffc2', 
                borderWidth: '1px',
                borderRadius: '0px',
                fontSize: '10px', 
                color: '#00ffc2',
                fontFamily: 'monospace'
              }}
              labelStyle={{ color: '#00ffc2', fontWeight: 'bold' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Legend 
              iconType="circle" 
              iconSize={6} 
              wrapperStyle={{ fontSize: '8px', fontFamily: 'monospace', opacity: 0.7, paddingTop: '10px' }}
            />
            {(filter === 'both' || filter === 'income') && (
              <Area 
                type="monotone" 
                dataKey="receitas" 
                stroke="#00d4ff" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorReceitas)" 
                name="RECEITAS" 
              />
            )}
            {(filter === 'both' || filter === 'expense') && (
              <Area 
                type="monotone" 
                dataKey="despesas" 
                stroke="#ff0055" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorDespesas)" 
                name="DESPESAS" 
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
