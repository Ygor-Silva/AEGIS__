import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Briefcase, Trophy, Medal, Award, Star, Zap } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, Legend, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { emitToast } from './Toast';
import { getSupabase } from '../lib/supabase';

interface SmartDashboardProps {
  income: number;
}

export default function SmartDashboard({ income }: SmartDashboardProps) {
  const [activeView, setActiveView] = useState<'overview' | 'trends' | 'goals' | 'achievements'>('overview');
  const [mainGoalLabel, setMainGoalLabel] = useState('RESERVA DE EMERGÊNCIA');
  const [customExpenses, setCustomExpenses] = useState<any[]>([]);
  const [customIncomes, setCustomIncomes] = useState<any[]>([]);

  const loadCustomTransactions = async () => {
    try {
      const supabase = getSupabase();
      if (supabase) {
        const { data: expData, error: expErr } = await supabase.from('expenses').select('*');
        const { data: incData, error: incErr } = await supabase.from('incomes').select('*');
        if (!expErr && expData) setCustomExpenses(expData);
        if (!incErr && incData) setCustomIncomes(incData);
      } else {
        setCustomExpenses(JSON.parse(localStorage.getItem('kerdos_expenses') || '[]'));
        setCustomIncomes(JSON.parse(localStorage.getItem('kerdos_incomes') || '[]'));
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadCustomTransactions();
    window.addEventListener('kerdos-add-transaction', loadCustomTransactions as EventListener);
    return () => window.removeEventListener('kerdos-add-transaction', loadCustomTransactions as EventListener);
  }, []);

  useEffect(() => {
    const savedOnboarding = localStorage.getItem("kerdos_onboarding_data");
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
      const notified80 = localStorage.getItem(`kerdos_notified_80_${goalName}`);
      if (!notified80) {
        setTimeout(() => {
          emitToast(`Parabéns! Você atingiu 80% da meta: ${goalName}.`, 'success');
          localStorage.setItem(`kerdos_notified_80_${goalName}`, "true");
        }, 1500);
      }
    } else if (currentProgress >= 1.0) {
      const notified100 = localStorage.getItem(`kerdos_notified_100_${goalName}`);
      if (!notified100) {
        setTimeout(() => {
          emitToast(`Incrível! Você concluiu 100% da meta: ${goalName}.`, 'success');
          localStorage.setItem(`kerdos_notified_100_${goalName}`, "true");
        }, 1500);
      }
    }
  }, [income]);

  // Calculate actual totals
  const customSumExpenses = customExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const customSumIncomes = customIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Instead of mock logic, start at 0 plus user's logged transactions
  const totalAssets = customSumIncomes - customSumExpenses;
  
  // Real-time dynamic values based on income and custom entries
  const totalIncome = income + customSumIncomes; // salary (base) + custom
  const totalExpenses = customSumExpenses; // no mock fixed base
  const currentBalance = totalIncome - totalExpenses;
  const projectedExpenses = 0; // We can't project easily without mock data, or maybe use customSumExpenses average
  const projectedBalance = currentBalance - projectedExpenses;

  // Fixed/Variable Breakdown (Just split custom into categories if we have them, else all in variable)
  const fixedExpenses = customExpenses.filter(e => e.isFixed).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const variableExpenses = customSumExpenses - fixedExpenses; 
  const invested = 0; // No mock investments

  const formatCurrency = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const trendData = [
    { name: 'JAN', despesas: 0, receitas: 0 },
    { name: 'FEV', despesas: 0, receitas: 0 },
    { name: 'MAR', despesas: 0, receitas: 0 },
    { name: 'ABR', despesas: 0, receitas: 0 },
    { name: 'MAI', despesas: 0, receitas: 0 },
    { name: 'JUN', despesas: Math.round(totalExpenses), receitas: Math.round(totalIncome) },
  ];

  let recentTransactions: any[] = [];

  // Merge custom transactions into recent (and sort by date ideally, but let's just append to top for visual feedback)
  const mappedCustomExp = customExpenses.map(e => ({
    date: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    description: e.description.toUpperCase(),
    type: 'expense',
    amount: e.amount
  }));
  const mappedCustomInc = customIncomes.map(e => ({
    date: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    description: e.description.toUpperCase(),
    type: 'income',
    amount: e.amount
  }));

  recentTransactions = [...mappedCustomInc, ...mappedCustomExp, ...recentTransactions].slice(0, 8);

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

  // Achievements Logic
  const hasOnboarding = localStorage.getItem("kerdos_onboarding_complete") === "true";
  const isPositiveCashflow = trendData.filter(d => d.receitas > d.despesas).length >= 3;
  const currentProgressPct = 80; // Hardcoded for demo to 80%
  const isGoalComplete = currentProgressPct >= 100;
  const isBudgetMaster = (totalExpenses / totalIncome) < 0.6; // Saving more than 40%

  return (
    <div className="flex flex-col h-full bg-[#0a1a2f]/60 border border-[var(--theme-color)]/30 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Header Tabs */}
      <div className="flex border-b border-[var(--theme-color)]/20 overflow-x-auto scrollbar-none shrink-0">
        <button onClick={() => setActiveView('overview')} className={`px-4 py-3 min-w-[120px] flex-1 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${activeView === 'overview' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-b-2 border-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}>Visão Geral</button>
        <button onClick={() => setActiveView('trends')} className={`px-4 py-3 min-w-[120px] flex-1 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${activeView === 'trends' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-b-2 border-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}>Tendências</button>
        <button onClick={() => setActiveView('goals')} className={`px-4 py-3 min-w-[120px] flex-1 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors ${activeView === 'goals' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-b-2 border-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}>Metas</button>
        <button onClick={() => setActiveView('achievements')} className={`px-4 py-3 min-w-[120px] flex-1 text-xs md:text-sm font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 ${activeView === 'achievements' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-b-2 border-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}><Trophy size={14} /> Conquistas</button>
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

        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
            </motion.div>
          )}

          {activeView === 'trends' && (
            <motion.div 
              key="trends"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
            </motion.div>
          )}

          {activeView === 'goals' && (
            <motion.div 
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
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
            </motion.div>
          )}

          {activeView === 'achievements' && (
            <motion.div 
              key="achievements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <h3 className="text-base font-bold text-[var(--theme-color)] uppercase tracking-wider mb-4 flex items-center gap-2">
                <Trophy size={18}/> Conquistas Desbloqueadas
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    id: 'primeiro-passo',
                    title: 'Primeiro Passo',
                    desc: 'Você definiu sua primeira meta no sistema e concluiu o Onboarding.',
                    icon: Star,
                    color: 'var(--theme-color)',
                    isUnlocked: hasOnboarding,
                    progressText: hasOnboarding ? 'DESBLOQUEADO' : 'BLOQUEADO'
                  },
                  {
                    id: 'caixa-positivo',
                    title: 'Caixa Positivo',
                    desc: 'Manteve seu saldo no verde por 3 meses consecutivos. Excelente disciplina.',
                    icon: Zap,
                    color: '#00d4ff',
                    isUnlocked: isPositiveCashflow,
                    progressText: isPositiveCashflow ? 'DESBLOQUEADO' : 'BLOQUEADO'
                  },
                  {
                    id: 'cem-por-cento',
                    title: '100% da Meta',
                    desc: 'Atinja 100% do progresso de sua meta principal para desbloquear.',
                    icon: Medal,
                    color: '#ffb000',
                    isUnlocked: isGoalComplete,
                    progressText: isGoalComplete ? 'DESBLOQUEADO' : `${currentProgressPct}% CONCLUÍDO`
                  },
                  {
                    id: 'mestre-orcamento',
                    title: 'Mestre do Orçamento',
                    desc: 'Poupe mais de 40% da sua renda e mantenha as despesas reduzidas.',
                    icon: Award,
                    color: '#b000ff',
                    isUnlocked: isBudgetMaster,
                    progressText: isBudgetMaster ? 'DESBLOQUEADO' : 'BLOQUEADO'
                  }
                ].map((ach, idx) => (
                  <div key={idx} className={`p-4 rounded-lg flex items-start gap-4 relative overflow-hidden transition-colors ${ach.isUnlocked ? 'bg-black/30 border-2 group cursor-pointer' : 'bg-black/20 border border-white/10 opacity-60 grayscale'}`} style={{ borderColor: ach.isUnlocked ? `${ach.color}80` : undefined }}>
                    {ach.isUnlocked && <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: `${ach.color}10` }} />}
                    <div className={`p-3 rounded-full border shrink-0 shadow-lg`} style={{ backgroundColor: ach.isUnlocked ? `${ach.color}20` : 'rgba(255,255,255,0.1)', borderColor: ach.isUnlocked ? `${ach.color}50` : 'rgba(255,255,255,0.2)', boxShadow: ach.isUnlocked ? `0 0 15px ${ach.color}` : 'none' }}>
                      <ach.icon size={24} color={ach.isUnlocked ? ach.color : 'rgba(255,255,255,0.5)'} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: ach.isUnlocked ? ach.color : 'rgba(255,255,255,0.5)' }}>{ach.title}</h4>
                      <p className="text-xs mb-2 leading-relaxed" style={{ color: ach.isUnlocked ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.4)' }}>{ach.desc}</p>
                      <div className="text-[10px] font-mono px-2 py-0.5 rounded-full inline-block border" style={{ backgroundColor: ach.isUnlocked ? `${ach.color}10` : 'rgba(255,255,255,0.05)', borderColor: ach.isUnlocked ? `${ach.color}30` : 'rgba(255,255,255,0.1)', color: ach.isUnlocked ? ach.color : 'rgba(255,255,255,0.4)' }}>
                        {ach.progressText}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
