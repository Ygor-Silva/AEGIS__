import React, { useState, useEffect, useRef } from 'react';
import { Target, TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Briefcase, Trophy, Medal, Award, Star, Zap, ChevronUp, ChevronDown } from 'lucide-react';
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

  // Chart Filters states
  const [periodFilter, setPeriodFilter] = useState<'3m' | '6m'>('6m');
  const [chartTypeFilter, setChartTypeFilter] = useState<'all' | 'receitas' | 'despesas'>('all');

  // Interactive filtering states below the chart
  const [selectedDashboardCategory, setSelectedDashboardCategory] = useState<'income' | 'expense' | null>(null);
  const [selectedDashboardMonth, setSelectedDashboardMonth] = useState<string | null>(null);
  const [isDashboardListExpanded, setIsDashboardListExpanded] = useState(true);

  const dashboardBarChartRef = useRef<HTMLDivElement>(null);
  const [dashboardBarMousePos, setDashboardBarMousePos] = useState<{ x: number; y: number } | null>(null);

  const dashboardAreaChartRef = useRef<HTMLDivElement>(null);
  const [dashboardAreaMousePos, setDashboardAreaMousePos] = useState<{ x: number; y: number } | null>(null);

  const getDashboardBarTooltipPos = () => {
    if (!dashboardBarMousePos || !dashboardBarChartRef.current) return undefined;
    const w = dashboardBarChartRef.current.clientWidth;
    const h = dashboardBarChartRef.current.clientHeight;
    const tooltipWidth = 240;
    const tooltipHeight = 120;
    const margin = 10;
    let tx = dashboardBarMousePos.x + 15;
    let ty = dashboardBarMousePos.y + 15;
    if (tx + tooltipWidth > w - margin) tx = dashboardBarMousePos.x - tooltipWidth - 15;
    if (tx < margin) tx = margin;
    if (ty + tooltipHeight > h - margin) ty = dashboardBarMousePos.y - tooltipHeight - 15;
    if (ty < margin) ty = margin;
    return { x: tx, y: ty };
  };

  const getDashboardAreaTooltipPos = () => {
    if (!dashboardAreaMousePos || !dashboardAreaChartRef.current) return undefined;
    const w = dashboardAreaChartRef.current.clientWidth;
    const h = dashboardAreaChartRef.current.clientHeight;
    const tooltipWidth = 240;
    const tooltipHeight = 120;
    const margin = 10;
    let tx = dashboardAreaMousePos.x + 15;
    let ty = dashboardAreaMousePos.y + 15;
    if (tx + tooltipWidth > w - margin) tx = dashboardAreaMousePos.x - tooltipWidth - 15;
    if (tx < margin) tx = margin;
    if (ty + tooltipHeight > h - margin) ty = dashboardAreaMousePos.y - tooltipHeight - 15;
    if (ty < margin) ty = margin;
    return { x: tx, y: ty };
  };

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

  // Proportional dynamic goals based on real assets (no mock hardcoded values)
  const rTarget = Math.round(income * 5); // Emergency reserve target is 5 months
  const lpTarget = Math.round(income * 3); // Long-term investments target is 3 months
  const uTarget = Math.round(income * 1); // Upgrade fund target is 1 month
  
  // Allocate totalAssets (surplus) to goals proportionally
  const rCurrent = Math.min(rTarget, Math.max(0, Math.round(totalAssets * 0.5)));
  const lpCurrent = Math.min(lpTarget, Math.max(0, Math.round(totalAssets * 0.3)));
  const uCurrent = Math.min(uTarget, Math.max(0, Math.round(totalAssets * 0.2)));
  
  const rPercent = rTarget > 0 ? Math.round((rCurrent / rTarget) * 100) : 0;
  const lpPercent = lpTarget > 0 ? Math.round((lpCurrent / lpTarget) * 100) : 0;
  const uPercent = uTarget > 0 ? Math.round((uCurrent / uTarget) * 100) : 0;

  // End of Month Projection Calculations
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const totalDaysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  
  // Current month's expenses
  const currentMonthExpenses = customExpenses
    .filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
    })
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  
  const dailySpendingRate = currentMonthExpenses / (currentDay || 1);
  const projectedMonthEndExpenses = dailySpendingRate * totalDaysInMonth;
  
  // Budget limit (using 80% of salary as target budget limit to save 20%)
  const monthlySpendingLimit = income * 0.8;
  const isOverBudgetProjection = projectedMonthEndExpenses > monthlySpendingLimit;
  const budgetUtilizationPercentage = Math.min(100, Math.round((projectedMonthEndExpenses / (monthlySpendingLimit || 1)) * 100));

  // Historic previous months average spending
  const previousMonthsExpensesList = customExpenses.filter(e => {
    const d = new Date(e.date);
    return d.getMonth() !== currentDate.getMonth() || d.getFullYear() !== currentDate.getFullYear();
  });
  
  const uniquePreviousMonths = Array.from(new Set(previousMonthsExpensesList.map(e => {
    const d = new Date(e.date);
    return `${d.getFullYear()}-${d.getMonth()}`;
  })));
  
  const previousMonthsAverageExpenses = uniquePreviousMonths.length > 0
    ? previousMonthsExpensesList.reduce((sum, e) => sum + (e.amount || 0), 0) / uniquePreviousMonths.length
    : income * 0.4; // fallback baseline if no historic data

  // Fixed/Variable Breakdown (Just split custom into categories if we have them, else all in variable)
  const fixedExpenses = customExpenses.filter(e => e.isFixed).reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const variableExpenses = customSumExpenses - fixedExpenses; 
  const invested = rCurrent + lpCurrent; // Represent real invested/saved value dynamically!

  // Category Alert Thresholds (90%+)
  const isFixedCritical = fixedExpenses > (income * 0.5) * 0.9;
  const isVariableCritical = variableExpenses > (income * 0.3) * 0.9;

  const assetPercentageChange = income > 0 ? (totalAssets / income) * 100 : 0;

  const formatCurrency = (val: number) => val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const getDynamicTrendData = () => {
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    const currentMonthIdx = new Date().getMonth();
    
    const trend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(currentMonthIdx - i);
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      trend.push({
        name: monthName,
        key: `${year}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        despesas: 0,
        receitas: 0
      });
    }

    // Populate actual custom transactions
    customExpenses.forEach(exp => {
      const expDate = new Date(exp.date);
      const key = `${expDate.getFullYear()}-${String(expDate.getMonth() + 1).padStart(2, '0')}`;
      const match = trend.find(m => m.key === key);
      if (match) {
        match.despesas += (exp.amount || 0);
      }
    });

    customIncomes.forEach(inc => {
      const incDate = new Date(inc.date);
      const key = `${incDate.getFullYear()}-${String(incDate.getMonth() + 1).padStart(2, '0')}`;
      const match = trend.find(m => m.key === key);
      if (match) {
        match.receitas += (inc.amount || 0);
      }
    });

    // Add base onboarding income to current month if positive
    if (trend[5] && income > 0) {
      trend[5].receitas += income;
    }

    // Apply period filter
    let filtered = trend;
    if (periodFilter === '3m') {
      filtered = trend.slice(-3);
    }

    return filtered;
  };

  const trendData = getDynamicTrendData();

  const getFilteredDashboardTransactions = () => {
    let allTx: any[] = [];
    
    const mappedCustomExp = customExpenses.map(e => ({
      id: e.id || `exp-${e.date}-${e.amount}`,
      dateStr: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      dateObj: new Date(e.date),
      description: e.description.toUpperCase(),
      type: 'expense',
      amount: e.amount,
      category: e.category || 'OUTROS'
    }));

    const mappedCustomInc = customIncomes.map(e => ({
      id: e.id || `inc-${e.date}-${e.amount}`,
      dateStr: new Date(e.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      dateObj: new Date(e.date),
      description: e.description.toUpperCase(),
      type: 'income',
      amount: e.amount,
      category: e.category || 'RECEITA'
    }));

    allTx = [...mappedCustomInc, ...mappedCustomExp];

    if (income > 0) {
      allTx.push({
        id: 'base-salary',
        dateStr: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
        dateObj: new Date(),
        description: 'SALÁRIO BASE (ONBOARDING)',
        type: 'income',
        amount: income,
        category: 'SALÁRIO'
      });
    }

    allTx.sort((a, b) => b.dateObj.getTime() - a.dateObj.getTime());

    if (selectedDashboardCategory) {
      allTx = allTx.filter(tx => tx.type === selectedDashboardCategory);
    }

    if (selectedDashboardMonth) {
      const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
      allTx = allTx.filter(tx => {
        const txMonthName = months[tx.dateObj.getMonth()];
        return txMonthName === selectedDashboardMonth;
      });
    }

    return allTx;
  };

  const recentTransactions = getFilteredDashboardTransactions().slice(0, 8);

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
          <div className="text-xs md:text-sm flex items-center mt-1 font-bold">
            {assetPercentageChange >= 0 ? (
              <>
                <TrendingUp size={16} className="mr-1 text-[var(--theme-color)]" />
                <span className="text-[var(--theme-color)]">+{assetPercentageChange.toFixed(1)}% no ano</span>
              </>
            ) : (
              <>
                <TrendingDown size={16} className="mr-1 text-[#ff0055]" />
                <span className="text-[#ff0055]">{assetPercentageChange.toFixed(1)}% no ano</span>
              </>
            )}
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
              <div className="bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-xs md:text-sm text-white/50 uppercase mb-1">Saldo Atual</div>
                  <div className="text-lg font-bold text-white">{formatCurrency(currentBalance)}</div>
                </div>
                <p className="text-[10px] text-white/40 mt-2 leading-tight">Total líquido disponível baseado nos seus lançamentos e receitas atuais.</p>
              </div>
              <div className="bg-[#ff0055]/5 border border-[#ff0055]/20 p-3 rounded-lg flex flex-col justify-between">
                <div>
                  <div className="text-xs md:text-sm text-white/50 uppercase mb-1">Saídas Previstas</div>
                  <div className="text-lg font-bold text-[#ff0055]">{formatCurrency(projectedExpenses)}</div>
                </div>
                <p className="text-[10px] text-[#ff0055]/50 mt-2 leading-tight">Valor reservado para contas que você indicou como recorrentes ou agendadas.</p>
              </div>
              <div className="col-span-2 bg-blue-500/5 border border-blue-500/20 p-3 rounded-lg flex flex-col gap-2 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="text-xs md:text-sm text-blue-400/80 uppercase mb-1 flex items-center gap-1.5">
                      Projeção Fim do Mês <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30 font-mono">TENDÊNCIA DIÁRIA</span>
                    </div>
                    <div className="text-xl font-bold text-blue-400">
                      {formatCurrency(totalIncome - projectedMonthEndExpenses)} <span className="text-xs font-normal text-white/50">(Saldo Projetado)</span>
                    </div>
                  </div>
                  <Activity className="text-blue-400 opacity-50 shrink-0" size={24} />
                </div>
                
                <div className="text-xs text-white/75 space-y-1 bg-black/20 p-2.5 rounded border border-blue-500/10">
                  <div className="flex justify-between">
                    <span>Média Diária Gasta:</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(dailySpendingRate)}/dia</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saídas Totais Projetadas:</span>
                    <span className="font-mono font-bold text-[#ff0055]">{formatCurrency(projectedMonthEndExpenses)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-white/5">
                    <span>Média de Meses Anteriores:</span>
                    <span className="font-mono text-white/60">{formatCurrency(previousMonthsAverageExpenses)}</span>
                  </div>
                  
                  <div className="pt-1.5">
                    {projectedMonthEndExpenses > previousMonthsAverageExpenses ? (
                      <p className="text-[10px] text-red-400 flex items-center gap-1 font-bold">
                        <span>⚠️ Gasto projetado está {((projectedMonthEndExpenses - previousMonthsAverageExpenses) / (previousMonthsAverageExpenses || 1) * 100).toFixed(1)}% acima da média histórica.</span>
                      </p>
                    ) : (
                      <p className="text-[10px] text-[var(--theme-color)] flex items-center gap-1 font-bold">
                        <span>✨ Gasto projetado está {((previousMonthsAverageExpenses - projectedMonthEndExpenses) / (previousMonthsAverageExpenses || 1) * 100).toFixed(1)}% abaixo da média histórica! Ótimo trabalho!</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1 pt-1">
                  <div className="flex justify-between text-[10px] font-mono text-white/50">
                    <span>Utilização do Orçamento Previsto ({budgetUtilizationPercentage}%)</span>
                    <span>Limite: {formatCurrency(monthlySpendingLimit)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${isOverBudgetProjection ? 'bg-[#ff0055] shadow-[0_0_8px_#ff0055]' : 'bg-blue-400 shadow-[0_0_8px_#3b82f6]'}`} 
                      style={{ width: `${budgetUtilizationPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="col-span-2 bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg flex justify-between items-center group relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--theme-color)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10 flex-1 pr-4">
                  <div className="text-xs md:text-sm text-[var(--theme-color)]/80 uppercase mb-1 flex items-center gap-1.5">
                    Previsão Inteligente <span className="text-[10px] bg-[var(--theme-color)]/20 text-[var(--theme-color)] px-2 py-0.5 rounded-full border border-[var(--theme-color)]/30 font-mono">REGRESSÃO LINEAR</span>
                  </div>
                  <div className="text-xl font-bold text-[var(--theme-color)]">{formatCurrency(regressionForecast)}</div>
                  <p className="text-xs text-white/50 mt-1">IA estima sua posição financeira futura traçando uma reta matemática sobre seu histórico.</p>
                  <div className="text-[10px] text-[var(--theme-color)]/60 mt-1.5 uppercase tracking-wider font-mono">Análise de tendência para o próximo período</div>
                </div>
                <TrendingUp className="text-[var(--theme-color)] opacity-50 relative z-10 shrink-0" size={32} />
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div>
              <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider mb-1 flex items-center gap-2"><PieChart size={16}/> Distribuição (50/30/20)</h3>
              <p className="text-xs text-white/40 mb-3">Recomendação ideal: 50% em essenciais (fixas), 30% em lazer (variáveis) e 20% em poupança/investimentos.</p>
              <div className="space-y-3">
                <div className={`transition-all duration-300 ${isFixedCritical ? 'bg-red-950/25 border-[#ff0055] border-2 shadow-[0_0_15px_rgba(255,0,85,0.4)] animate-[pulse_2s_infinite]' : 'bg-black/30 border border-white/10'} p-3 rounded-lg`}>
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="text-white/80 flex items-center gap-1.5">
                      Fixas (Essenciais) - Moradia, saúde, contas
                      {isFixedCritical && (
                        <span className="text-[9px] bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                          ⚠️ CRÍTICO (90%+)
                        </span>
                      )}
                    </span>
                    <span className={`font-bold ${isFixedCritical ? 'text-[#ff0055]' : 'text-white'}`}>{formatCurrency(fixedExpenses)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${isFixedCritical ? 'bg-[#ff0055]' : 'bg-[var(--theme-color)]'}`} style={{ width: `${Math.min(100, (fixedExpenses / ((income * 0.5) || 1)) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                    <span>Gasto Real</span>
                    <span>Teto Sugerido (50%): {formatCurrency(income * 0.5)}</span>
                  </div>
                </div>
                
                <div className={`transition-all duration-300 ${isVariableCritical ? 'bg-red-950/25 border-[#ff0055] border-2 shadow-[0_0_15px_rgba(255,0,85,0.4)] animate-[pulse_2s_infinite]' : 'bg-black/30 border border-white/10'} p-3 rounded-lg`}>
                  <div className="flex justify-between items-center text-sm mb-1.5">
                    <span className="text-white/80 flex items-center gap-1.5">
                      Variáveis (Lifestyle) - Lazer, delivery, compras
                      {isVariableCritical && (
                        <span className="text-[9px] bg-[#ff0055]/20 text-[#ff0055] border border-[#ff0055]/30 px-1.5 py-0.5 rounded font-mono font-bold tracking-widest uppercase">
                          ⚠️ CRÍTICO (90%+)
                        </span>
                      )}
                    </span>
                    <span className={`font-bold ${isVariableCritical ? 'text-[#ff0055]' : 'text-purple-400'}`}>{formatCurrency(variableExpenses)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${isVariableCritical ? 'bg-[#ff0055]' : 'bg-purple-500'}`} style={{ width: `${Math.min(100, (variableExpenses / ((income * 0.3) || 1)) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                    <span>Gasto Real</span>
                    <span>Teto Sugerido (30%): {formatCurrency(income * 0.3)}</span>
                  </div>
                </div>

                <div className="bg-black/30 border border-white/10 p-3 rounded-lg">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-white/80">Investimentos - Poupança e longo prazo (20%)</span>
                    <span className="font-bold text-blue-400">{formatCurrency(invested)}</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${Math.min(100, (invested / ((income * 0.2) || 1)) * 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-white/40 mt-1 font-mono">
                    <span>Progresso Atual</span>
                    <span>Alvo Sugerido: {formatCurrency(income * 0.2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Comparativo Mensal (Mês Atual vs Anterior) */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider flex items-center gap-2">
                  <Activity size={16}/> Comparativo Mensal
                </h3>
                
                {/* Filters Row */}
                <div className="flex gap-2 text-xs font-mono">
                  <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden">
                    <button 
                      onClick={() => setPeriodFilter('3m')} 
                      className={`px-2 py-1 transition-colors ${periodFilter === '3m' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}
                    >
                      3M
                    </button>
                    <button 
                      onClick={() => setPeriodFilter('6m')} 
                      className={`px-2 py-1 transition-colors ${periodFilter === '6m' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-l border-white/10' : 'text-white/50 hover:text-white border-l border-white/10'}`}
                    >
                      6M
                    </button>
                  </div>

                  <div className="flex bg-black/40 border border-white/10 rounded overflow-hidden">
                    <button 
                      onClick={() => setChartTypeFilter('all')} 
                      className={`px-2 py-1 transition-colors ${chartTypeFilter === 'all' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-white'}`}
                    >
                      TUDO
                    </button>
                    <button 
                      onClick={() => setChartTypeFilter('receitas')} 
                      className={`px-2 py-1 transition-colors ${chartTypeFilter === 'receitas' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-l border-white/10' : 'text-white/50 hover:text-white border-l border-white/10'}`}
                    >
                      REC
                    </button>
                    <button 
                      onClick={() => setChartTypeFilter('despesas')} 
                      className={`px-2 py-1 transition-colors ${chartTypeFilter === 'despesas' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)] border-l border-white/10' : 'text-white/50 hover:text-white border-l border-white/10'}`}
                    >
                      DESP
                    </button>
                  </div>
                </div>
              </div>

              <div ref={dashboardBarChartRef} className="h-56 w-full bg-black/30 border border-white/10 rounded-lg p-3 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={trendData} 
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    onMouseMove={(state) => {
                      if (state && state.chartX !== undefined && state.chartY !== undefined) {
                        setDashboardBarMousePos({ x: state.chartX, y: state.chartY });
                      } else {
                        setDashboardBarMousePos(null);
                      }
                    }}
                    onMouseLeave={() => setDashboardBarMousePos(null)}
                    onClick={(state) => {
                      if (state && state.activeLabel) {
                        setSelectedDashboardMonth(state.activeLabel);
                        setIsDashboardListExpanded(true);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(1)}k`} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a1a2f', borderColor: 'var(--theme-color)', borderRadius: '8px', fontSize: '12px' }}
                      formatter={(value: number) => formatCurrency(value)}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                      position={getDashboardBarTooltipPos()}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                    {(chartTypeFilter === 'all' || chartTypeFilter === 'receitas') && (
                      <Bar 
                        dataKey="receitas" 
                        name="Receitas" 
                        fill="var(--theme-color)" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={30} 
                        className="cursor-pointer"
                        onClick={(data, index) => {
                          setSelectedDashboardCategory('income');
                          if (data && data.name) {
                            setSelectedDashboardMonth(data.name);
                          } else if (trendData[index]) {
                            setSelectedDashboardMonth(trendData[index].name);
                          }
                          setIsDashboardListExpanded(true);
                        }}
                      />
                    )}
                    {(chartTypeFilter === 'all' || chartTypeFilter === 'despesas') && (
                      <Bar 
                        dataKey="despesas" 
                        name="Despesas" 
                        fill="#ff0055" 
                        radius={[4, 4, 0, 0]} 
                        maxBarSize={30} 
                        className="cursor-pointer"
                        onClick={(data, index) => {
                          setSelectedDashboardCategory('expense');
                          if (data && data.name) {
                            setSelectedDashboardMonth(data.name);
                          } else if (trendData[index]) {
                            setSelectedDashboardMonth(trendData[index].name);
                          }
                          setIsDashboardListExpanded(true);
                        }}
                      />
                    )}
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Collapsible List below the Cash Flow chart */}
              <div className="mt-4 border-t border-white/10 pt-4">
                <div 
                  onClick={() => setIsDashboardListExpanded(!isDashboardListExpanded)}
                  className="flex justify-between items-center bg-black/30 hover:bg-black/50 border border-white/5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-[var(--theme-color)]" />
                    <span className="text-xs font-black tracking-widest text-white uppercase">
                      {selectedDashboardCategory && selectedDashboardMonth 
                        ? `Lançamentos: ${selectedDashboardCategory === 'income' ? 'Receitas' : 'Despesas'} em ${selectedDashboardMonth}`
                        : selectedDashboardCategory 
                        ? `Lançamentos: ${selectedDashboardCategory === 'income' ? 'Receitas' : 'Despesas'}`
                        : selectedDashboardMonth
                        ? `Lançamentos em: ${selectedDashboardMonth}`
                        : "Lançamentos Recentes"}
                    </span>
                    {(selectedDashboardCategory || selectedDashboardMonth) && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDashboardCategory(null);
                          setSelectedDashboardMonth(null);
                        }}
                        className="text-[9px] bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded text-white font-mono uppercase ml-1"
                      >
                        Limpar Filtros
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-white/50 font-mono">
                      {getFilteredDashboardTransactions().length} item(ns)
                    </span>
                    {isDashboardListExpanded ? <ChevronUp size={14} className="text-white/70" /> : <ChevronDown size={14} className="text-white/70" />}
                  </div>
                </div>

                {isDashboardListExpanded && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/15"
                  >
                    {getFilteredDashboardTransactions().length === 0 ? (
                      <p className="text-xs text-white/40 italic py-2 text-center">Nenhuma transação registrada para o filtro atual.</p>
                    ) : (
                      getFilteredDashboardTransactions().map((tx, idx) => (
                        <div key={tx.id || idx} className="flex justify-between items-center bg-black/30 border border-white/5 p-2.5 rounded-lg hover:border-[var(--theme-color)]/30 transition-colors">
                          <div className="flex flex-col flex-1 min-w-0 pr-2">
                            <span className="text-xs font-bold text-white uppercase truncate">{tx.description}</span>
                            <span className="text-[10px] text-white/40">{tx.dateStr} • {tx.category}</span>
                          </div>
                          <span className={`text-xs font-mono font-bold shrink-0 ${tx.type === 'income' ? 'text-[var(--theme-color)]' : 'text-[#ff0055]'}`}>
                            {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
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
            <div ref={dashboardAreaChartRef} className="h-48 w-full bg-black/40 border border-[var(--theme-color)]/10 rounded-lg p-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={trendData} 
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.chartX !== undefined && state.chartY !== undefined) {
                      setDashboardAreaMousePos({ x: state.chartX, y: state.chartY });
                    } else {
                      setDashboardAreaMousePos(null);
                    }
                  }}
                  onMouseLeave={() => setDashboardAreaMousePos(null)}
                >
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
                  <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(1)}k`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0a1a2f', borderColor: 'var(--theme-color)', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => formatCurrency(value)}
                    position={getDashboardAreaTooltipPos()}
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
            <h3 className="text-base font-bold text-[var(--theme-color)] uppercase tracking-wider mb-1 flex items-center gap-2"><Target size={16}/> Metas Ativas</h3>
            <p className="text-xs text-white/40 mb-3">Acompanhe seus fundos dedicados. Seus saldos e aportes no chat atualizam o progresso.</p>
            
            <div className="space-y-4">
              <div className="bg-black/30 border border-[var(--theme-color)]/20 p-4 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-base font-bold text-[var(--theme-color)]">{mainGoalLabel}</span>
                  <span className="text-base font-bold text-white">{rPercent}%</span>
                </div>
                <div className="text-xs text-white/70 mb-3 space-y-1 bg-black/20 p-2.5 rounded border border-[var(--theme-color)]/10">
                  <p className="font-bold text-[var(--theme-color)]">💡 Reserva de Emergência:</p>
                  <p className="leading-relaxed">Garante tranquilidade cobrindo imprevistos inesperados (saúde, consertos, transição de carreira) sem precisar contrair dívidas caras. O ideal é manter de 3 a 6 meses de suas despesas essenciais protegidos aqui.</p>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-[var(--theme-color)] shadow-[0_0_10px_var(--theme-color)] transition-all duration-1000" style={{ width: `${rPercent}%` }} />
                </div>
                <div className="flex justify-between text-base text-white/50">
                  <span>Atual: {formatCurrency(rCurrent)}</span>
                  <span>Meta: {formatCurrency(rTarget)}</span>
                </div>
              </div>

              <div className="bg-black/30 border border-blue-400/20 p-4 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-base font-bold text-blue-400">INVESTIMENTOS LP</span>
                  <span className="text-base font-bold text-white">{lpPercent}%</span>
                </div>
                <div className="text-xs text-white/70 mb-3 space-y-1 bg-black/20 p-2.5 rounded border border-blue-400/10">
                  <p className="font-bold text-blue-400">💡 Investimentos de Longo Prazo:</p>
                  <p className="leading-relaxed">Focado na multiplicação exponencial do seu patrimônio através de juros compostos (ações, fundos imobiliários, previdência privada). Este dinheiro trabalha por você para construir sua aposentadoria e independência financeira futuro.</p>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-blue-400 shadow-[0_0_10px_#3b82f6] transition-all duration-1000" style={{ width: `${lpPercent}%` }} />
                </div>
                <div className="flex justify-between text-base text-white/50">
                  <span>Atual: {formatCurrency(lpCurrent)}</span>
                  <span>Meta: {formatCurrency(lpTarget)}</span>
                </div>
              </div>

              <div className="bg-black/30 border border-purple-400/20 p-4 rounded-lg">
                <div className="flex justify-between mb-1">
                  <span className="text-base font-bold text-purple-400">FUNDO DE UPGRADES</span>
                  <span className="text-base font-bold text-white">{uPercent}%</span>
                </div>
                <div className="text-xs text-white/70 mb-3 space-y-1 bg-black/20 p-2.5 rounded border border-purple-400/10">
                  <p className="font-bold text-purple-400">💡 Fundo de Upgrades e Lifestyle:</p>
                  <p className="leading-relaxed">Destinado para aquisição planejada de bens de consumo (viagens, computadores, carro, cursos) de forma saudável. Poupar previamente elimina parcelamentos nocivos e garante que você compre à vista com desconto.</p>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-purple-400 shadow-[0_0_10px_#a855f7] transition-all duration-1000" style={{ width: `${uPercent}%` }} />
                </div>
                <div className="flex justify-between text-base text-white/50">
                  <span>Atual: {formatCurrency(uCurrent)}</span>
                  <span>Meta: {formatCurrency(uTarget)}</span>
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
