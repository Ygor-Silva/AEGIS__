import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Briefcase } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { emitToast } from './Toast';

interface SmartDashboardProps {
  income: number;
}

export default function SmartDashboard({ income }: SmartDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'goals'>('overview');
  const [mainGoalLabel, setMainGoalLabel] = useState('RESERVA DE EMERGÊNCIA');

  useEffect(() => {
    const savedOnboarding = localStorage.getItem("aegis_onboarding_data");
    let goalName = "RESERVA DE EMERGÊNCIA";
    if (savedOnboarding) {
      try {
        const data = JSON.parse(savedOnboarding);
        if (data.goal === 'imovel') goalName = "COMPRAR IMÓVEL";
        if (data.goal === 'aposentadoria') goalName = "APOSENTADORIA";
        if (data.goal === 'viagem') goalName = "VIAGEM / LAZER";
        if (data.goal === 'investimentos') goalName = "MAXIMIZAR INVESTIMENTOS";
      } catch (e) {}
    }
    setMainGoalLabel(goalName);

    // Dynamic progress calculation based on income (for demonstration)
    // 80% reached:
    const currentProgress = 0.8; 
    
    if (currentProgress >= 0.8 && currentProgress < 1.0) {
      const notified80 = localStorage.getItem(`aegis_notified_80_${goalName}`);
      if (!notified80) {
        setTimeout(() => {
          emitToast(`Parabéns! Você atingiu 80% da meta: ${goalName}.`, 'success');
          localStorage.setItem(`aegis_notified_80_${goalName}`, "true");
        }, 1500);
      }
    } else if (currentProgress >= 1.0) {
      const notified100 = localStorage.getItem(`aegis_notified_100_${goalName}`);
      if (!notified100) {
        setTimeout(() => {
          emitToast(`Incrível! Você concluiu 100% da meta: ${goalName}.`, 'success');
          localStorage.setItem(`aegis_notified_100_${goalName}`, "true");
        }, 1500);
      }
    }
  }, [income]);

  // Real-time dynamic values based on income
  const totalAssets = income * 8.578024;
  const totalIncome = income + (income * 0.038); // salary + dividend
  const totalExpenses = (income * 0.2976) + (income * 0.10125) + (income * 0.0369); // aluguel + mercado + energia
  const currentBalance = totalIncome - totalExpenses;
  const projectedExpenses = currentBalance * 0.247;
  const projectedBalance = currentBalance - projectedExpenses;

  // Fixed/Variable Breakdown
  const fixedExpenses = income * 0.3576;
  const variableExpenses = income * 0.23425;
  const invested = income - (fixedExpenses + variableExpenses);

  const formatCurrency = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const trendData = [
    { name: 'JAN', despesas: Math.round(totalExpenses * 1.1), receitas: Math.round(totalIncome * 0.95) },
    { name: 'FEV', despesas: Math.round(totalExpenses * 0.9), receitas: Math.round(totalIncome * 0.98) },
    { name: 'MAR', despesas: Math.round(totalExpenses * 1.05), receitas: Math.round(totalIncome * 1.02) },
    { name: 'ABR', despesas: Math.round(totalExpenses * 0.95), receitas: Math.round(totalIncome * 1.05) },
    { name: 'MAI', despesas: Math.round(totalExpenses * 1.15), receitas: Math.round(totalIncome * 0.99) },
    { name: 'JUN', despesas: Math.round(totalExpenses), receitas: Math.round(totalIncome) },
  ];

  const recentTransactions = [
    { date: '01/06', description: 'SALÁRIO', type: 'income', amount: income },
    { date: '05/06', description: 'ALUGUEL', type: 'expense', amount: income * 0.2976 },
    { date: '12/06', description: 'SUPERMERCADO', type: 'expense', amount: income * 0.10125 },
    { date: '18/06', description: 'DIVIDENDOS', type: 'income', amount: income * 0.038 },
  ];

  // Linear Regression Forecast for End-of-Month Remaining Budget
  const n = trendData.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  trendData.forEach((d, i) => {
    const x = i + 1;
    const y = d.receitas - d.despesas;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const regressionForecast = Math.max(0, (slope * (n + 1)) + intercept);

  return (
    <div className="flex flex-col h-full bg-[#0a1a2f]/60 border border-[var(--theme-color)]/30 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Header Tabs */}
      <div className="flex border-b border-[var(--theme-color)]/20">
        <button onClick={() => setActiveView('overview')} className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${activeView === 'overview' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}>Visão Geral</button>
        <button onClick={() => setActiveView('trends')} className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${activeView === 'trends' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}>Tendências</button>
        <button onClick={() => setActiveView('goals')} className={`flex-1 py-3 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${activeView === 'goals' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}>Metas</button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
        
        {/* Total Assets - Always visible at top of content */}
        <div className="bg-black/40 border border-[var(--theme-color)]/20 p-4 rounded-lg relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center gap-3 mb-2">
            <Briefcase className="text-[var(--theme-color)]" size={20} />
            <h2 className="text-xs md:text-sm font-bold text-white/50 uppercase tracking-widest">Patrimônio Total</h2>
          </div>
          <div className="text-3xl lg:text-4xl font-black text-white tracking-tight">
            {formatCurrency(totalAssets)}
          </div>
          <div className="text-xs md:text-sm text-[var(--theme-color)] flex items-center mt-1 font-bold">
            <TrendingUp size={16} className="mr-1" />
            <span>+12.4% no ano</span>
          </div>
        </div>

        {activeView === 'overview' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Balance Projection Unified */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg">
                <div className="text-xs md:text-sm text-white/50 uppercase mb-1">Saldo Atual</div>
                <div className="text-lg font-bold text-white">{formatCurrency(currentBalance)}</div>
              </div>
              <div className="bg-[#ff0055]/5 border border-[#ff0055]/20 p-3 rounded-lg">
                <div className="text-xs md:text-sm text-white/50 uppercase mb-1">Saídas Previstas</div>
                <div className="text-lg font-bold text-[#ff0055]">{formatCurrency(projectedExpenses)}</div>
              </div>
              <div className="col-span-2 bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="text-xs md:text-sm text-blue-400/80 uppercase mb-1 flex items-center gap-1.5">
                    Projeção Fim do Mês <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">SIMPLES</span>
                  </div>
                  <div className="text-xl font-bold text-blue-400">{formatCurrency(projectedBalance)}</div>
                </div>
                <Activity className="text-blue-400 opacity-50" size={32} />
              </div>
              <div className="col-span-2 bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg flex justify-between items-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--theme-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-xs md:text-sm text-[var(--theme-color)]/80 uppercase mb-1 flex items-center gap-1.5">
                    Previsão Inteligente <span className="text-[10px] bg-[var(--theme-color)]/20 text-[var(--theme-color)] px-2 py-0.5 rounded-full border border-[var(--theme-color)]/30">REGRESSÃO LINEAR</span>
                  </div>
                  <div className="text-xl font-bold text-[var(--theme-color)]">{formatCurrency(regressionForecast)}</div>
                  <div className="text-[10px] text-[var(--theme-color)]/60 mt-1 uppercase tracking-wider">Baseado no histórico de {n} meses</div>
                </div>
                <TrendingUp className="text-[var(--theme-color)] opacity-50 relative z-10" size={32} />
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider mb-3 flex items-center gap-2"><PieChart size={16}/> Distribuição (50/30/20)</h3>
              <div className="space-y-3">
                <div className="bg-black/30 border border-white/10 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/80">Fixas (Essenciais)</span>
                    <span className="font-bold text-white">{formatCurrency(fixedExpenses)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--theme-color)]" style={{ width: `${(fixedExpenses / income) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-black/30 border border-white/10 p-3 rounded-lg">
                  <div className="flex justify-between text-base mb-1">
                    <span className="text-white/80">Variáveis (Lifestyle)</span>
                    <span className="font-bold text-purple-400">{formatCurrency(variableExpenses)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${(variableExpenses / income) * 100}%` }} />
                  </div>
                </div>
                <div className="bg-black/30 border border-white/10 p-3 rounded-lg">
                  <div className="flex justify-between text-base mb-1">
                    <span className="text-white/80">Investimentos</span>
                    <span className="font-bold text-blue-400">{formatCurrency(invested)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(invested / income) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Comparativo Mensal (Mês Atual vs Anterior) */}
            <div>
              <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider mb-3 flex items-center gap-2"><Activity size={16}/> Comparativo Mensal</h3>
              <div className="h-48 w-full bg-black/30 border border-white/10 rounded-lg p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[trendData[trendData.length - 2], trendData[trendData.length - 1]]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1a2f', borderColor: 'var(--theme-color)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    <Bar dataKey="receitas" name="Receitas" fill="var(--theme-color)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="despesas" name="Despesas" fill="#ff0055" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeView === 'trends' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider mb-2 flex items-center gap-2"><TrendingUp size={16}/> Tendência de Caixa</h3>
            <div className="h-48 w-full bg-black/40 border border-[var(--theme-color)]/10 rounded-lg p-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--theme-color)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--theme-color)" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDesp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0055" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value/1000}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1a2f', borderColor: 'var(--theme-color)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area type="monotone" dataKey="receitas" stroke="var(--theme-color)" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="despesas" stroke="#ff0055" strokeWidth={2} fillOpacity={1} fill="url(#colorDesp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-base font-bold text-[var(--theme-color)] uppercase tracking-wider mb-3">Extrato Recente</h3>
              <div className="space-y-2">
                {recentTransactions.map((tx, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-black/30 border border-white/5 p-3 rounded-lg hover:border-[var(--theme-color)]/30 transition-colors">
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-white">{tx.description}</span>
                      <span className="text-base text-white/40">{tx.date}</span>
                    </div>
                    <span className={`text-base font-bold ${tx.type === 'income' ? 'text-[var(--theme-color)]' : 'text-white/80'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeView === 'goals' && (
          <div className="space-y-6 animate-fadeIn">
            <h3 className="text-base font-bold text-[var(--theme-color)] uppercase tracking-wider mb-2 flex items-center gap-2"><Target size={16}/> Metas Ativas</h3>
            
            <div className="space-y-4">
              <div className="bg-black/30 border border-[var(--theme-color)]/20 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-base font-bold text-[var(--theme-color)]">{mainGoalLabel}</span>
                  <span className="text-base font-bold text-white">80%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[var(--theme-color)] shadow-[0_0_10px_var(--theme-color)]" style={{ width: '80%' }} />
                </div>
                <div className="flex justify-between text-base text-white/50">
                  <span>Atual: {formatCurrency(income * 4)}</span>
                  <span>Meta: {formatCurrency(income * 5)}</span>
                </div>
              </div>

              <div className="bg-black/30 border border-blue-400/20 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-base font-bold text-blue-400">INVESTIMENTOS LP</span>
                  <span className="text-base font-bold text-white">80%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-blue-400 shadow-[0_0_10px_#3b82f6]" style={{ width: '80%' }} />
                </div>
                <div className="flex justify-between text-base text-white/50">
                  <span>Atual: {formatCurrency(income * 2.4)}</span>
                  <span>Meta: {formatCurrency(income * 3)}</span>
                </div>
              </div>

              <div className="bg-black/30 border border-purple-400/20 p-4 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-base font-bold text-purple-400">FUNDO DE UPGRADES</span>
                  <span className="text-base font-bold text-white">70%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-purple-400 shadow-[0_0_10px_#a855f7]" style={{ width: '70%' }} />
                </div>
                <div className="flex justify-between text-base text-white/50">
                  <span>Atual: {formatCurrency(income * 0.7)}</span>
                  <span>Meta: {formatCurrency(income * 1)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
