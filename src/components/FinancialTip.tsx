import React, { useState, useEffect } from 'react';
import { Lightbulb, TrendingDown, ShieldAlert, Sparkles, TrendingUp, Info, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getSupabase } from '../lib/supabase';

export default function FinancialTip() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [incomes, setIncomes] = useState<any[]>([]);

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

  // Generate dynamic tips based on actual data
  const getDynamicTips = () => {
    const tips = [];
    const hasTransactions = expenses.length > 0 || incomes.length > 0;
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const totalIncomes = incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
    const fixedExp = expenses.filter(e => e.isFixed).reduce((sum, e) => sum + (e.amount || 0), 0);
    
    // Tip 1: Onboarding / Welcome (Always show if no transactions)
    if (!hasTransactions) {
      tips.push({
        id: 'onboarding-welcome',
        title: "Primeiro Registro",
        text: "Você está com o sistema zerado! Fale comigo no terminal à esquerda: 'Gastei R$ 1200 com aluguel' ou 'Recebi R$ 3000 de salário'. Isso preencherá seus gráficos instantaneamente.",
        icon: Info,
        color: "text-[var(--theme-color)]",
        bg: "bg-[var(--theme-color)]/10",
        border: "border-[var(--theme-color)]/30"
      });
      tips.push({
        id: 'onboarding-fixed',
        title: "Cadastre Contas Fixas",
        text: "Adicionar suas contas fixas recorrentes (luz, água, aluguel) ajuda a IA a projetar o seu saldo no final do mês com 99% de precisão. Tente agora!",
        icon: Zap,
        color: "text-blue-400",
        bg: "bg-blue-400/10",
        border: "border-blue-400/30"
      });
    } else {
      // Dynamic insights if there is data
      const fixedRatio = totalIncomes > 0 ? (fixedExp / totalIncomes) : 0;
      if (fixedRatio > 0.5) {
        tips.push({
          id: 'high-fixed',
          title: "Custos Fixos Elevados",
          text: `Suas contas fixas representam ${(fixedRatio * 100).toFixed(0)}% das suas receitas. O ideal recomendado pela regra 50/30/20 é manter abaixo de 50%. Tente negociar assinaturas e planos.`,
          icon: ShieldAlert,
          color: "text-amber-400",
          bg: "bg-amber-400/10",
          border: "border-amber-400/30"
        });
      }

      const savingsRate = totalIncomes > 0 ? ((totalIncomes - totalExpenses) / totalIncomes) : 0;
      if (savingsRate > 0.3) {
        tips.push({
          id: 'high-savings',
          title: "Excelente Poupança!",
          text: `Você poupou ${(savingsRate * 100).toFixed(0)}% das suas receitas recentemente! Que tal destinar uma fatia desse saldo para investimentos de longo prazo?`,
          icon: TrendingUp,
          color: "text-[var(--theme-color)]",
          bg: "bg-[var(--theme-color)]/10",
          border: "border-[var(--theme-color)]/30"
        });
      } else if (savingsRate < 0.1 && hasTransactions) {
        tips.push({
          id: 'low-savings',
          title: "Alerta de Margem Estreita",
          text: "Suas despesas estão consumindo quase todo o seu saldo. Considere analisar a categoria de gastos variáveis no gráfico para identificar vazamentos de caixa.",
          icon: ShieldAlert,
          color: "text-red-400",
          bg: "bg-red-400/10",
          border: "border-red-400/30"
        });
      }

      // Default smart tips
      tips.push({
        id: 'subscription-check',
        title: "Revisão de Assinaturas",
        text: "Considere auditar mensalmente serviços recorrentes de streaming ou aplicativos. Cancelar apenas um serviço não utilizado pode poupar mais de R$ 400 por ano.",
        icon: TrendingDown,
        color: "text-purple-400",
        bg: "bg-purple-400/10",
        border: "border-purple-400/30"
      });
    }

    // Always include a general educational tip
    tips.push({
      id: 'general-rule',
      title: "Método 50/30/20",
      text: "Divida sua renda líquida em: 50% para Necessidades (contas fixas, moradia), 30% para Desejos (lazer, hobbies) e 20% para Poupança e amortização de dívidas.",
      icon: Sparkles,
      color: "text-cyan-400",
      bg: "bg-cyan-400/10",
      border: "border-cyan-400/30"
    });

    return tips;
  };

  const dynamicTips = getDynamicTips();

  useEffect(() => {
    // Reset index if tips length changes
    setCurrentTipIndex(0);
  }, [expenses.length, incomes.length]);

  useEffect(() => {
    if (dynamicTips.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % dynamicTips.length);
    }, 12000);
    return () => clearInterval(interval);
  }, [dynamicTips.length]);

  const activeIndex = currentTipIndex >= dynamicTips.length ? 0 : currentTipIndex;
  const tip = dynamicTips[activeIndex];
  if (!tip) return null;
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
          {dynamicTips.map((_, idx) => (
            <button 
              key={idx} 
              onClick={() => setCurrentTipIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex ? 'w-4 bg-[var(--theme-color)]' : 'w-1.5 bg-white/20'
              }`}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/40 uppercase font-mono tracking-widest">
          KERDOS ANALYTICS
        </span>
      </div>
    </div>
  );
}
