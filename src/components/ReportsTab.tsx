import React, { useState, useEffect, useRef } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download, 
  Calendar, 
  PieChart as PieIcon, 
  BarChart2, 
  Percent, 
  Activity, 
  Briefcase,
  Mail,
  Send,
  Copy,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from "recharts";
import { motion } from "motion/react";
import { getSupabase } from "../lib/supabase";
import { generateKerdosPDF } from "../utils/pdfGenerator";

export default function ReportsTab() {
  const [reportPeriod, setReportPeriod] = useState<"monthly" | "annual">("monthly");
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string | null>(null);
  const [categoryListExpanded, setCategoryListExpanded] = useState(true);

  const flowChartRef = useRef<HTMLDivElement>(null);
  const [flowMousePos, setFlowMousePos] = useState<{ x: number; y: number } | null>(null);

  const curveChartRef = useRef<HTMLDivElement>(null);
  const [curveMousePos, setCurveMousePos] = useState<{ x: number; y: number } | null>(null);

  const getFlowTooltipPos = () => {
    if (!flowMousePos || !flowChartRef.current) return undefined;
    const w = flowChartRef.current.clientWidth;
    const h = flowChartRef.current.clientHeight;
    const tooltipWidth = 280;
    const tooltipHeight = 220;
    const margin = 10;
    let tx = flowMousePos.x + 15;
    let ty = flowMousePos.y + 15;
    if (tx + tooltipWidth > w - margin) tx = flowMousePos.x - tooltipWidth - 15;
    if (tx < margin) tx = margin;
    if (ty + tooltipHeight > h - margin) ty = flowMousePos.y - tooltipHeight - 15;
    if (ty < margin) ty = margin;
    return { x: tx, y: ty };
  };

  const getCurveTooltipPos = () => {
    if (!curveMousePos || !curveChartRef.current) return undefined;
    const w = curveChartRef.current.clientWidth;
    const h = curveChartRef.current.clientHeight;
    const tooltipWidth = 245;
    const tooltipHeight = 120;
    const margin = 10;
    let tx = curveMousePos.x + 15;
    let ty = curveMousePos.y + 15;
    if (tx + tooltipWidth > w - margin) tx = curveMousePos.x - tooltipWidth - 15;
    if (tx < margin) tx = margin;
    if (ty + tooltipHeight > h - margin) ty = curveMousePos.y - tooltipHeight - 15;
    if (ty < margin) ty = margin;
    return { x: tx, y: ty };
  };

  // AI Weekly Summary and Email States
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [emailInput, setEmailInput] = useState(() => localStorage.getItem("user_email") || "usuario@kerdos.com");
  const [copiedToast, setCopiedToast] = useState(false);
  const [sendStatus, setSendStatus] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    setSendStatus(null);
    try {
      const response = await fetch("/api/weekly-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          incomes,
          expenses,
          income,
          email: emailInput,
        }),
      });
      if (response.ok) {
        const result = await response.json();
        setSummaryData(result);
        localStorage.setItem("user_email", emailInput);
        if (result.sent) {
          setSendStatus("Esboço gerado e enviado automaticamente via Resend!");
        }
      } else {
        const err = await response.json();
        alert(err.error || "Erro ao conectar com a IA");
      }
    } catch (error: any) {
      alert("Erro ao enviar requisição para o servidor: " + error.message);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleSendEmail = () => {
    if (!summaryData) return;
    if (summaryData.hasResendKey && summaryData.sent) {
      setSendStatus("E-mail enviado via Resend!");
    } else {
      // Fallback: mailto
      const subject = encodeURIComponent(summaryData.subject);
      // Remove html tags for mailto body fallback
      const cleanBody = summaryData.body.replace(/<[^>]*>/g, "\n");
      const body = encodeURIComponent(cleanBody);
      window.open(`mailto:${emailInput}?subject=${subject}&body=${body}`);
      setSendStatus("Cliente de e-mail local aberto como fallback!");
    }
  };

  const handleCopyEsboco = () => {
    if (!summaryData) return;
    navigator.clipboard.writeText(summaryData.body);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 3000);
  };

  const loadData = async () => {
    try {
      const savedOnboarding = localStorage.getItem("kerdos_onboarding_data");
      if (savedOnboarding) {
        const parsed = JSON.parse(savedOnboarding);
        setIncome(parseFloat(parsed.income) || 0);
      }
      
      const supabase = getSupabase();
      if (supabase) {
        const { data: expData } = await supabase.from('expenses').select('*');
        const { data: incData } = await supabase.from('incomes').select('*');
        setExpenses(expData || []);
        setIncomes(incData || []);
      } else {
        setExpenses(JSON.parse(localStorage.getItem('kerdos_expenses') || '[]'));
        setIncomes(JSON.parse(localStorage.getItem('kerdos_incomes') || '[]'));
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('kerdos-add-transaction', loadData);
    return () => window.removeEventListener('kerdos-add-transaction', loadData);
  }, []);

  const formatCurrency = (val: number) => {
    return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  // Months List
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Helper: Filter records by selected month or annual range
  const getFilteredTransactions = () => {
    const currentYear = new Date().getFullYear();
    
    let filteredIncomes = incomes.map(i => ({ ...i, dateObj: new Date(i.date) }));
    let filteredExpenses = expenses.map(e => ({ ...e, dateObj: new Date(e.date) }));

    if (reportPeriod === "monthly") {
      filteredIncomes = filteredIncomes.filter(i => 
        i.dateObj.getMonth() === selectedMonth && i.dateObj.getFullYear() === currentYear
      );
      filteredExpenses = filteredExpenses.filter(e => 
        e.dateObj.getMonth() === selectedMonth && e.dateObj.getFullYear() === currentYear
      );
    } else {
      filteredIncomes = filteredIncomes.filter(i => i.dateObj.getFullYear() === currentYear);
      filteredExpenses = filteredExpenses.filter(e => e.dateObj.getFullYear() === currentYear);
    }

    return { filteredIncomes, filteredExpenses };
  };

  const { filteredIncomes, filteredExpenses } = getFilteredTransactions();

  // Onboarding Base Salary included dynamically
  const baseSalary = income;
  
  // Totals calculations
  const customIncomeTotal = filteredIncomes.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const totalInflow = customIncomeTotal + (reportPeriod === "monthly" ? baseSalary : baseSalary * 12);
  
  const totalOutflow = filteredExpenses.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const netSavings = totalInflow - totalOutflow;
  const savingsRate = totalInflow > 0 ? (netSavings / totalInflow) * 100 : 0;

  // Monthly breakdown for Annual visualization
  const getAnnualData = () => {
    const data = months.map((month, idx) => {
      const monthExpenses = expenses
        .filter(e => new Date(e.date).getMonth() === idx && new Date(e.date).getFullYear() === new Date().getFullYear())
        .reduce((sum, e) => sum + (e.amount || 0), 0);
        
      const monthIncomes = incomes
        .filter(i => new Date(i.date).getMonth() === idx && new Date(i.date).getFullYear() === new Date().getFullYear())
        .reduce((sum, i) => sum + (i.amount || 0), 0);

      // Add base salary to each month
      const totalMonthIncomes = monthIncomes + baseSalary;

      return {
        name: month.substring(0, 3).toUpperCase(),
        receitas: totalMonthIncomes,
        despesas: monthExpenses,
        saldo: totalMonthIncomes - monthExpenses
      };
    });

    return data;
  };

  // Category distribution calculation
  const getCategoryData = () => {
    const categoriesMap: { [key: string]: number } = {};
    
    filteredExpenses.forEach(exp => {
      const cat = exp.category ? exp.category.toUpperCase() : "OUTROS";
      categoriesMap[cat] = (categoriesMap[cat] || 0) + (exp.amount || 0);
    });

    const data = Object.keys(categoriesMap).map(key => ({
      name: key,
      value: categoriesMap[key]
    }));

    if (data.length === 0) {
      return [{ name: "NENHUM REGISTRO", value: 1 }];
    }

    return data;
  };

  const categoryData = getCategoryData();
  const COLORS = ["#00ffc2", "#00d4ff", "#a855f7", "#ff0055", "#ffb000", "#3b82f6", "#10b981", "#6b7280"];

  // Annual Balance Curve Accumulation
  const getAccumulatedCurveData = () => {
    const annualData = getAnnualData();
    let cumulative = 0;
    return annualData.map(item => {
      cumulative += item.saldo;
      return {
        name: item.name,
        patrimonio: cumulative
      };
    });
  };

  const getRecentTransactionsForCategory = () => {
    let allTx: any[] = [];
    
    const salaryItem = {
      id: "base-salary",
      description: "Salário Base (Onboarding)",
      amount: baseSalary,
      category: "SALÁRIO",
      date: new Date().toISOString(),
      type: "income"
    };
    
    const mappedIncomes = filteredIncomes.map(inc => ({
      ...inc,
      type: "income"
    }));
    
    const mappedExpenses = filteredExpenses.map(exp => ({
      ...exp,
      type: "expense"
    }));

    allTx = [salaryItem, ...mappedIncomes, ...mappedExpenses];

    if (selectedCategory) {
      const catUpper = selectedCategory.toUpperCase();
      if (catUpper === "RECEITAS" || catUpper === "RECEITA" || catUpper === "SALÁRIO" || catUpper === "SALÁRIO BASE") {
        allTx = allTx.filter(tx => tx.type === "income");
      } else if (catUpper === "DESPESAS" || catUpper === "DESPESA") {
        allTx = allTx.filter(tx => tx.type === "expense");
      } else {
        allTx = allTx.filter(tx => (tx.category || "OUTROS").toUpperCase() === catUpper);
      }
    }

    if (selectedMonthFilter) {
      const monthNamesShort = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
      allTx = allTx.filter(tx => {
        const d = new Date(tx.date);
        const mName = monthNamesShort[d.getMonth()];
        return mName === selectedMonthFilter;
      });
    }

    return allTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const handlePdfExport = async () => {
    setIsExporting(true);
    try {
      await generateKerdosPDF();
    } catch (e) {
      console.error("Failed to generate PDF:", e);
    } finally {
      setIsExporting(false);
    }
  };

  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    // Get month index from label name (e.g., "JAN" -> 0, etc.)
    const monthNamesShort = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    let mIdx = selectedMonth; // Default to selected month if single view
    if (reportPeriod === "annual") {
      mIdx = monthNamesShort.indexOf(label);
    }
    if (mIdx === -1) mIdx = selectedMonth;

    // Filter transactions for this specific month
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === mIdx && d.getFullYear() === new Date().getFullYear();
    });

    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === mIdx && d.getFullYear() === new Date().getFullYear();
    });

    // Group month expenses by day for interactive granular breakdown
    const dailyExpensesMap: { [day: number]: number } = {};
    monthExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const day = d.getDate();
      dailyExpensesMap[day] = (dailyExpensesMap[day] || 0) + (exp.amount || 0);
    });

    const sortedDays = Object.keys(dailyExpensesMap)
      .map(d => parseInt(d))
      .sort((a, b) => a - b);

    return (
      <div className="bg-[#051329]/95 border border-[var(--theme-color)] p-4 rounded-lg shadow-[0_4px_30px_rgba(0,0,0,0.8)] w-72 backdrop-blur-md">
        <p className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/10 pb-2 mb-2 flex justify-between">
          <span>{reportPeriod === "annual" ? months[mIdx] : "Mês Corrente"}</span>
          <span className="text-[var(--theme-color)] font-mono font-black">FLUXO DE CAIXA</span>
        </p>
        
        <div className="space-y-3.5">
          {/* Receitas summary */}
          <div>
            <p className="text-xs text-[var(--theme-color)] uppercase font-bold mb-1 flex items-center justify-between">
              <span>Receitas:</span>
              <span className="font-mono font-black">{formatCurrency(payload[0]?.value || 0)}</span>
            </p>
            <div className="space-y-1 bg-black/25 p-2 rounded">
              {/* Include base salary as line item */}
              <div className="flex justify-between text-xs text-white/80 font-mono">
                <span className="truncate max-w-[150px]">💰 Salário Base</span>
                <span className="text-[var(--theme-color)] font-bold">{formatCurrency(baseSalary)}</span>
              </div>
              {monthIncomes.slice(0, 2).map((inc, i) => (
                <div key={i} className="flex justify-between text-xs text-white/80 font-mono">
                  <span className="truncate max-w-[150px]">💵 {inc.description}</span>
                  <span className="text-[var(--theme-color)] font-bold">{formatCurrency(inc.amount)}</span>
                </div>
              ))}
              {monthIncomes.length > 2 && (
                <p className="text-[10px] text-white/40 italic">+ {monthIncomes.length - 2} outras receitas</p>
              )}
            </div>
          </div>

          {/* Despesas summary */}
          <div>
            <p className="text-xs text-[#ff0055] uppercase font-bold mb-1 flex items-center justify-between">
              <span>Despesas:</span>
              <span className="font-mono font-black">{formatCurrency(payload[1]?.value || 0)}</span>
            </p>
            {monthExpenses.length === 0 ? (
              <p className="text-xs text-white/40 italic bg-black/25 p-2 rounded">Sem despesas registradas.</p>
            ) : (
              <div className="space-y-1 bg-black/25 p-2 rounded mb-2">
                {monthExpenses.slice(0, 3).map((exp, i) => (
                  <div key={i} className="flex justify-between text-xs text-white/80 font-mono">
                    <span className="truncate max-w-[150px]">📉 {exp.description}</span>
                    <span className="text-[#ff0055] font-bold">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
                {monthExpenses.length > 3 && (
                  <p className="text-[10px] text-white/40 italic">+ {monthExpenses.length - 3} outras despesas</p>
                )}
              </div>
            )}
          </div>

          {/* Granular Daily Expenses Breakdown */}
          <div className="border-t border-white/10 pt-2.5">
            <p className="text-xs text-purple-400 uppercase font-black mb-2 flex items-center gap-1.5">
              <Activity size={12} /> Detalhamento Diário:
            </p>
            {sortedDays.length === 0 ? (
              <p className="text-xs text-white/40 italic font-mono">Sem saídas neste mês.</p>
            ) : (
              <div className="max-h-32 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
                {sortedDays.map((day) => {
                  const dayExpenses = monthExpenses.filter(e => new Date(e.date).getDate() === day);
                  return (
                    <div key={day} className="bg-white/5 p-1.5 rounded hover:bg-white/10 transition-colors">
                      <div className="flex justify-between text-xs text-white font-mono font-bold">
                        <span>Dia {String(day).padStart(2, '0')}</span>
                        <span className="text-[#ff0055]">{formatCurrency(dailyExpensesMap[day])}</span>
                      </div>
                      <div className="text-[10px] text-white/60 truncate font-mono max-w-[240px] mt-0.5">
                        {dayExpenses.map(e => e.description).join(", ")}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const monthNamesShort = ["JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO", "SET", "OUT", "NOV", "DEZ"];
    const mIdx = monthNamesShort.indexOf(label);
    if (mIdx === -1) return null;

    // Filter transactions for this specific month
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === mIdx && d.getFullYear() === new Date().getFullYear();
    });

    const monthIncomes = incomes.filter(i => {
      const d = new Date(i.date);
      return d.getMonth() === mIdx && d.getFullYear() === new Date().getFullYear();
    });

    const totalMonthExp = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalMonthInc = monthIncomes.reduce((sum, i) => sum + (i.amount || 0), 0) + baseSalary;

    // Group month expenses by day
    const dailyExpensesMap: { [day: number]: number } = {};
    monthExpenses.forEach(exp => {
      const d = new Date(exp.date);
      const day = d.getDate();
      dailyExpensesMap[day] = (dailyExpensesMap[day] || 0) + (exp.amount || 0);
    });

    const sortedDays = Object.keys(dailyExpensesMap)
      .map(d => parseInt(d))
      .sort((a, b) => a - b);

    const accumulatedVal = payload[0]?.value || 0;

    return (
      <div className="bg-[#051329]/95 border border-blue-400 p-4 rounded-lg shadow-[0_4px_30px_rgba(0,0,0,0.8)] w-72 backdrop-blur-md">
        <p className="font-bold text-white text-xs uppercase tracking-widest border-b border-white/10 pb-2 mb-2 flex justify-between">
          <span>{months[mIdx]}</span>
          <span className="text-blue-400 font-mono font-black">EVOLUÇÃO</span>
        </p>

        <div className="space-y-2.5 mb-2.5">
          <div className="flex justify-between items-center bg-blue-500/10 p-2 rounded border border-blue-500/20">
            <span className="text-[10px] text-white/75 font-mono uppercase">Patrimônio:</span>
            <span className="text-sm text-blue-400 font-black font-mono">{formatCurrency(accumulatedVal)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="bg-black/20 p-1.5 rounded border border-white/5">
              <span className="text-white/40 block text-[9px]">RECEITAS</span>
              <span className="text-[var(--theme-color)] font-bold">{formatCurrency(totalMonthInc)}</span>
            </div>
            <div className="bg-black/20 p-1.5 rounded border border-white/5">
              <span className="text-white/40 block text-[9px]">SAÍDAS</span>
              <span className="text-[#ff0055] font-bold">{formatCurrency(totalMonthExp)}</span>
            </div>
          </div>
        </div>

        {/* Detalhamento Diário de Gastos */}
        <div className="border-t border-white/10 pt-2.5">
          <p className="text-xs text-purple-400 uppercase font-black mb-2 flex items-center gap-1.5">
            <Activity size={12} /> Detalhamento Diário:
          </p>
          {sortedDays.length === 0 ? (
            <p className="text-xs text-white/40 italic font-mono">Sem saídas neste mês.</p>
          ) : (
            <div className="max-h-28 overflow-y-auto pr-1 space-y-1.5 scrollbar-thin scrollbar-thumb-white/15 scrollbar-track-transparent">
              {sortedDays.map((day) => {
                const dayExpenses = monthExpenses.filter(e => new Date(e.date).getDate() === day);
                return (
                  <div key={day} className="bg-white/5 p-1.5 rounded hover:bg-white/10 transition-colors">
                    <div className="flex justify-between text-xs text-white font-mono font-bold">
                      <span>Dia {String(day).padStart(2, '0')}</span>
                      <span className="text-[#ff0055] font-bold">{formatCurrency(dailyExpensesMap[day])}</span>
                    </div>
                    <div className="text-[10px] text-white/60 truncate font-mono max-w-[240px] mt-0.5">
                      {dayExpenses.map(e => e.description).join(", ")}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#0a1a2f]/60 border border-[var(--theme-color)]/30 rounded-xl overflow-hidden backdrop-blur-md">
      {/* Top Controls Header */}
      <div className="p-4 border-b border-[var(--theme-color)]/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/40 relative z-10 shrink-0">
        <div>
          <h2 className="text-lg font-black tracking-widest text-white uppercase flex items-center gap-2">
            <Activity className="text-[var(--theme-color)]" size={20} /> Relatórios Financeiros
          </h2>
          <p className="text-xs text-white/50">Gere visões consolidadas e exporte relatórios consolidados em PDF.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Period Toggle */}
          <div className="flex bg-black/50 border border-white/10 rounded-lg overflow-hidden p-0.5">
            <button 
              onClick={() => setReportPeriod("monthly")} 
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${reportPeriod === "monthly" ? "bg-[var(--theme-color)]/20 text-[var(--theme-color)]" : "text-white/50 hover:text-white"}`}
            >
              Mensal
            </button>
            <button 
              onClick={() => setReportPeriod("annual")} 
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${reportPeriod === "annual" ? "bg-[var(--theme-color)]/20 text-[var(--theme-color)]" : "text-white/50 hover:text-white"}`}
            >
              Anual
            </button>
          </div>

          {/* Month Selector */}
          {reportPeriod === "monthly" && (
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="bg-black/60 border border-white/10 text-white text-xs font-bold rounded-lg px-3 py-1.5 outline-none focus:border-[var(--theme-color)] transition-colors"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx} disabled={idx > new Date().getMonth() && new Date().getFullYear() === new Date().getFullYear()}>
                  {m}
                </option>
              ))}
            </select>
          )}

          {/* Export PDF Button */}
          <button 
            onClick={handlePdfExport}
            disabled={isExporting}
            className="bg-[var(--theme-color)] text-black font-black text-xs uppercase tracking-wider px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-white hover:shadow-[0_0_15px_var(--theme-color)] active:scale-95 transition-all disabled:opacity-50 shrink-0"
          >
            <Download size={14} /> {isExporting ? "Gerando..." : "Exportar PDF"}
          </button>
        </div>
      </div>

      {/* Main Reports View area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-none">
        {/* EXECUTIVE KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/30 border border-white/15 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Entradas Totais</span>
              <TrendingUp className="text-[var(--theme-color)]" size={16} />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-black text-white">{formatCurrency(totalInflow)}</div>
              <p className="text-[10px] text-white/40 mt-1">Soma de sua renda base e rendas adicionais lançadas.</p>
            </div>
          </div>

          <div className="bg-black/30 border border-white/15 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Saídas Totais</span>
              <TrendingDown className="text-[#ff0055]" size={16} />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-black text-[#ff0055]">{formatCurrency(totalOutflow)}</div>
              <p className="text-[10px] text-white/40 mt-1">Total de despesas fixas e variáveis deduzidas.</p>
            </div>
          </div>

          <div className="bg-black/30 border border-white/15 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Acúmulo Líquido</span>
              <DollarSign className="text-blue-400" size={16} />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-black text-blue-400">{formatCurrency(netSavings)}</div>
              <p className="text-[10px] text-white/40 mt-1">Saldo restante disponível para aportar em suas metas.</p>
            </div>
          </div>

          <div className="bg-black/30 border border-white/15 p-4 rounded-xl flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-2">
              <span className="text-xs uppercase font-bold tracking-wider">Taxa de Poupança</span>
              <Percent className="text-purple-400" size={16} />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-black text-purple-400">{savingsRate.toFixed(1)}%</div>
              <p className="text-[10px] text-white/40 mt-1">Porcentagem da renda que foi poupada no período.</p>
            </div>
          </div>
        </div>

        {/* DOUBLE COLUMN CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Flow Chart (Receitas vs Despesas) */}
          <div className="lg:col-span-8 bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-wider text-white uppercase mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart2 size={16} className="text-[var(--theme-color)]" /> Comparativo de Fluxo de Caixa
                </span>
                <span className="text-[9px] text-white/40 italic font-mono uppercase">Clique nas barras ou pizza para inspecionar</span>
              </h3>
              <div ref={flowChartRef} className="h-64 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={reportPeriod === "monthly" ? [
                      { name: "Mês Selecionado", receitas: totalInflow, despesas: totalOutflow }
                    ] : getAnnualData()} 
                    margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                    onMouseMove={(state) => {
                      if (state && state.chartX !== undefined && state.chartY !== undefined) {
                        setFlowMousePos({ x: state.chartX, y: state.chartY });
                      } else {
                        setFlowMousePos(null);
                      }
                    }}
                    onMouseLeave={() => setFlowMousePos(null)}
                    onClick={(state) => {
                      if (state && state.activeLabel) {
                        setSelectedMonthFilter(state.activeLabel === "Mês Selecionado" ? null : state.activeLabel);
                        setCategoryListExpanded(true);
                      }
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(1)}k`} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }} 
                      position={getFlowTooltipPos()}
                      content={<CustomChartTooltip />} 
                      wrapperStyle={{ pointerEvents: 'none', zIndex: 100 }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                    <Bar 
                      dataKey="receitas" 
                      name="Receitas" 
                      fill="var(--theme-color)" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={35} 
                      className="cursor-pointer"
                      onClick={(data, index) => {
                        setSelectedCategory("RECEITAS");
                        setCategoryListExpanded(true);
                      }}
                    />
                    <Bar 
                      dataKey="despesas" 
                      name="Despesas" 
                      fill="#ff0055" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={35} 
                      className="cursor-pointer"
                      onClick={(data, index) => {
                        setSelectedCategory("DESPESAS");
                        setCategoryListExpanded(true);
                      }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Collapsible Recent Transactions List */}
            <div className="mt-4 border-t border-white/10 pt-4">
              <div 
                onClick={() => setCategoryListExpanded(!categoryListExpanded)}
                className="flex justify-between items-center bg-black/30 hover:bg-black/50 border border-white/5 px-3 py-2.5 rounded-lg cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Activity size={14} className="text-[var(--theme-color)]" />
                  <span className="text-xs font-black tracking-widest text-white uppercase">
                    {selectedCategory && selectedMonthFilter 
                      ? `Transações: ${selectedCategory} em ${selectedMonthFilter}`
                      : selectedCategory 
                      ? `Transações: ${selectedCategory}`
                      : selectedMonthFilter
                      ? `Transações em: ${selectedMonthFilter}`
                      : "Lançamentos Recentes do Mês"}
                  </span>
                  {(selectedCategory || selectedMonthFilter) && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCategory(null);
                        setSelectedMonthFilter(null);
                      }}
                      className="text-[9px] bg-white/10 hover:bg-white/20 px-1.5 py-0.5 rounded text-white font-mono uppercase"
                    >
                      Limpar Filtros
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-white/50 font-mono">
                    {getRecentTransactionsForCategory().length} item(ns)
                  </span>
                  {categoryListExpanded ? <ChevronUp size={14} className="text-white/70" /> : <ChevronDown size={14} className="text-white/70" />}
                </div>
              </div>
              
              {categoryListExpanded && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-2 space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/15"
                >
                  {getRecentTransactionsForCategory().length === 0 ? (
                    <p className="text-xs text-white/40 italic py-2 text-center">Nenhuma transação registrada nesta categoria.</p>
                  ) : (
                    getRecentTransactionsForCategory().map((tx: any, idx: number) => (
                      <div key={tx.id || idx} className="flex justify-between items-center bg-white/5 border border-white/5 p-2 rounded hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${tx.type === "income" ? "bg-[var(--theme-color)] shadow-[0_0_8px_var(--theme-color)]" : "bg-[#ff0055] shadow-[0_0_8px_#ff0055]"}`} />
                          <div className="min-w-0">
                            <p className="text-xs text-white font-bold truncate max-w-[200px] sm:max-w-[320px]">{tx.description}</p>
                            <p className="text-[10px] text-white/45 font-mono">
                              {new Date(tx.date).toLocaleDateString("pt-BR")} | <span className="text-purple-400 font-semibold">{tx.category ? tx.category.toUpperCase() : "OUTROS"}</span>
                            </p>
                          </div>
                        </div>
                        <span className={`text-xs font-black font-mono shrink-0 pl-2 ${tx.type === "income" ? "text-[var(--theme-color)]" : "text-[#ff0055]"}`}>
                          {tx.type === "income" ? "+" : "-"} {formatCurrency(tx.amount || tx.value || 0)}
                        </span>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </div>
          </div>

          {/* Pie Chart (Expenses Breakdown by Category) */}
          <div className="lg:col-span-4 bg-black/40 border border-white/10 p-4 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-black tracking-wider text-white uppercase mb-1 flex items-center gap-2">
                <PieIcon size={16} className="text-purple-400" /> Distribuição de Despesas
              </h3>
              <p className="text-[10px] text-white/40 mb-3">Principais categorias de saídas registradas.</p>
            </div>

            <div className="h-44 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                    onClick={(data) => {
                      if (data && data.name && data.name !== "NENHUM REGISTRO") {
                        setSelectedCategory(selectedCategory === data.name ? null : data.name);
                        setCategoryListExpanded(true);
                      }
                    }}
                    className="cursor-pointer outline-none"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute text-center">
                <span className="text-[10px] text-white/55 block uppercase font-mono">Total Saídas</span>
                <span className="text-sm font-black text-[#ff0055]">{formatCurrency(totalOutflow)}</span>
              </div>
            </div>

            {/* Custom Legend */}
            <div className="mt-3 space-y-1 overflow-y-auto max-h-24 scrollbar-none pr-1">
              {categoryData.map((entry, idx) => (
                <div 
                  key={idx} 
                  onClick={() => {
                    if (entry.name !== "NENHUM REGISTRO") {
                      setSelectedCategory(selectedCategory === entry.name ? null : entry.name);
                      setCategoryListExpanded(true);
                    }
                  }}
                  className={`flex justify-between items-center text-[10px] cursor-pointer p-1 rounded transition-all ${selectedCategory === entry.name ? "bg-white/10 border-l-2 border-[var(--theme-color)]" : "hover:bg-white/5"}`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-white/70 truncate uppercase font-mono">{entry.name}</span>
                  </div>
                  <span className="font-bold text-white shrink-0 font-mono">
                    {totalOutflow > 0 && entry.name !== "NENHUM REGISTRO" ? `${((entry.value / totalOutflow) * 100).toFixed(1)}%` : "0%"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ANNUAL BALANCED CURVE AREA CHART */}
        {reportPeriod === "annual" && (
          <div className="bg-black/40 border border-white/10 p-4 rounded-xl">
            <h3 className="text-xs font-black tracking-wider text-white uppercase mb-3 flex items-center gap-2">
              <Briefcase size={16} className="text-blue-400" /> Evolução Patrimonial Estimada
            </h3>
            <p className="text-xs text-white/50 mb-3">Previsão de crescimento acumulado do ano com base nos seus saldos mensais livres.</p>
            <div ref={curveChartRef} className="h-56 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={getAccumulatedCurveData()} 
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                  onMouseMove={(state) => {
                    if (state && state.chartX !== undefined && state.chartY !== undefined) {
                      setCurveMousePos({ x: state.chartX, y: state.chartY });
                    } else {
                      setCurveMousePos(null);
                    }
                  }}
                  onMouseLeave={() => setCurveMousePos(null)}
                >
                  <defs>
                    <linearGradient id="colorPatrimonio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#ffffff50" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${(value/1000).toFixed(1)}k`} />
                  <Tooltip 
                    cursor={{ stroke: 'transparent' }} 
                    position={getCurveTooltipPos()}
                    content={<CustomAreaTooltip />} 
                    wrapperStyle={{ pointerEvents: 'none', zIndex: 100 }}
                  />
                  <Area type="monotone" dataKey="patrimonio" name="Acúmulo de Saldo" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorPatrimonio)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* AI WEEKLY FINANCIAL SUMMARY & EMAIL DRAWER */}
        <div className="bg-gradient-to-r from-blue-950/40 to-purple-950/40 border border-[var(--theme-color)]/30 p-5 rounded-xl space-y-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[var(--theme-color)]/10 rounded-lg text-[var(--theme-color)] animate-pulse">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-wider text-[var(--theme-color)] uppercase">
                  Inteligência Artificial Kerdos — Resumo de Desempenho
                </h4>
                <p className="text-[10px] text-white/50">Gere um diagnóstico profundo e um rascunho de e-mail pronto para envio.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input 
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Seu e-mail..."
                className="bg-black/60 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 outline-none focus:border-[var(--theme-color)] transition-colors w-44 font-mono"
              />
              <button 
                onClick={handleGenerateSummary}
                disabled={isGeneratingSummary}
                className="bg-[var(--theme-color)]/15 border border-[var(--theme-color)]/30 hover:bg-[var(--theme-color)] hover:text-black text-[var(--theme-color)] font-black text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all disabled:opacity-50 flex items-center gap-1 shrink-0"
              >
                {isGeneratingSummary ? (
                  <>
                    <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Sparkles size={12} />
                    Gerar Diagnóstico Semanal
                  </>
                )}
              </button>
            </div>
          </div>

          {summaryData && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 border-t border-white/5 pt-4"
            >
              <div className="bg-black/20 p-3.5 rounded-lg border border-white/5 space-y-2">
                <p className="text-[10px] uppercase font-bold text-[var(--theme-color)] tracking-wider">Breve Diagnóstico:</p>
                <p className="text-xs text-white/80 leading-relaxed font-mono italic">"{summaryData.summary}"</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono text-white/50">
                  <span>ESBOÇO DE E-MAIL GERADO (ASSUNTO: "{summaryData.subject}")</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleCopyEsboco}
                      className="text-white/60 hover:text-white flex items-center gap-1 bg-white/5 px-2 py-1 rounded"
                    >
                      <Copy size={10} /> {copiedToast ? "Copiado!" : "Copiar HTML"}
                    </button>
                    <button 
                      onClick={handleSendEmail}
                      className="text-[var(--theme-color)] hover:text-white flex items-center gap-1 bg-[var(--theme-color)]/10 px-2 py-1 rounded border border-[var(--theme-color)]/20"
                    >
                      <Send size={10} /> Enviar E-mail
                    </button>
                  </div>
                </div>

                {sendStatus && (
                  <p className="text-[10px] text-[var(--theme-color)] font-bold animate-pulse font-mono">
                    👉 {sendStatus}
                  </p>
                )}

                <div className="w-full h-64 bg-white rounded-lg overflow-hidden border border-white/10 shadow-inner">
                  <iframe 
                    title="Email Draft Preview"
                    srcDoc={summaryData.body}
                    className="w-full h-full bg-white border-none"
                  />
                </div>
                
                {!summaryData.hasResendKey && (
                  <p className="text-[9px] text-white/30 leading-relaxed">
                    💡 <strong>Dica de Integração:</strong> Para enviar este relatório de forma 100% automatizada e invisível, você pode configurar a variável de ambiente <code>RESEND_API_KEY</code> no painel de configurações do seu app na AI Studio! Caso contrário, o Kerdos usa o protocolo <code>mailto:</code> como um fallback inteligente e seguro.
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* DIDACTIC EDUCATION SUMMARY */}
        <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 shrink-0">
            <Percent size={20} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-wider text-blue-400 uppercase mb-1">Dica de Gestão: O que significa sua Taxa de Poupança?</h4>
            <p className="text-xs text-white/70 leading-relaxed">
              Sua Taxa de Poupança atual de <strong className="text-blue-300 font-mono">{savingsRate.toFixed(1)}%</strong> reflete a eficiência de sua retenção financeira. 
              {savingsRate < 10 && " Ela está abaixo de 10%. Recomendamos cortar gastos supérfluos ou usar nosso chat para cadastrar rendas adicionais e atingir a meta ideal de 20%."}
              {savingsRate >= 10 && savingsRate < 20 && " Parabéns! Você está no caminho certo. Tente otimizar pequenas despesas fixas para alcançar o limiar de 20% recomendado por especialistas."}
              {savingsRate >= 20 && " Incrível! Sua taxa está excelente e acima dos 20%. Continue alocando essa sobra nos seus cartões de metas ativas para acelerar a independência financeira!"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
