import React, { useState } from 'react';
import { Target, Plus, Check } from 'lucide-react';
import { emitToast } from './Toast';

interface Goal {
  id: string;
  name: string;
  current: number;
  target: number;
  color: string; // 'neon' | 'blue' | 'magenta'
}

export default function GoalsProgress() {
  const [goals, setGoals] = useState<Goal[]>(() => {
    const savedOnboarding = localStorage.getItem("kerdos_onboarding_data");
    const onboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
    const income = onboarding ? parseFloat(onboarding.income) || 5000 : 5000;
    
    // Load custom transactions to calculate exact assets
    const customExpenses = JSON.parse(localStorage.getItem('kerdos_expenses') || '[]');
    const customIncomes = JSON.parse(localStorage.getItem('kerdos_incomes') || '[]');
    const customSumExpenses = customExpenses.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const customSumIncomes = customIncomes.reduce((acc: number, curr: any) => acc + (curr.amount || 0), 0);
    const totalAssets = customSumIncomes - customSumExpenses;

    // Calculate realistic proportional goals based on the calibrated income
    const rTarget = Math.round(income * 5); // 5 months of income for emergency reserve
    const rCurrent = Math.min(rTarget, Math.max(0, Math.round(totalAssets * 0.5)));
    
    const lpTarget = Math.round(income * 3); // 3 months of income for LP investments
    const lpCurrent = Math.min(lpTarget, Math.max(0, Math.round(totalAssets * 0.3)));
    
    const uTarget = Math.round(income * 1); // 1 month of income for upgrades
    const uCurrent = Math.min(uTarget, Math.max(0, Math.round(totalAssets * 0.2)));
    
    return [
      { id: '1', name: 'RESERVA DE EMERGÊNCIA', current: rCurrent, target: rTarget, color: 'neon' },
      { id: '2', name: 'INVESTIMENTOS LP', current: lpCurrent, target: lpTarget, color: 'blue' },
      { id: '3', name: 'FUNDO DE UPGRADES', current: uCurrent, target: uTarget, color: 'magenta' },
    ];
  });

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');
  const [newColor, setNewColor] = useState('neon');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newTarget) {
      emitToast('Preencha o título e a meta do objetivo.', 'error');
      return;
    }
    const targetVal = parseFloat(newTarget);
    if (isNaN(targetVal) || targetVal <= 0) {
      emitToast('Informe um valor de meta válido.', 'error');
      return;
    }

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: newTitle.toUpperCase().trim(),
      current: 0,
      target: targetVal,
      color: newColor,
    };

    setGoals([...goals, newGoal]);
    setNewTitle('');
    setNewTarget('');
    setShowAdd(false);
    emitToast('Novo objetivo de economia ativado no HUD.', 'success');
  };

  const getBarColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-[#00d4ff] shadow-[0_0_10px_#00d4ff]';
      case 'magenta':
        return 'bg-[#b000ff] shadow-[0_0_10px_#b000ff]';
      default:
        return 'bg-[var(--theme-color)] shadow-[0_0_10px_var(--theme-color)]';
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-[#00d4ff]/30';
      case 'magenta':
        return 'border-[#b000ff]/30';
      default:
        return 'border-[var(--theme-color)]/30';
    }
  };

  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-[#00d4ff]';
      case 'magenta':
        return 'text-[#b000ff]';
      default:
        return 'text-[var(--theme-color)]';
    }
  };

  return (
    <div className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/10 p-3 flex flex-col mt-3 relative overflow-hidden">
      {/* Subtle background scanner just for context */}
      <div className="scanner-overlay-neon opacity-10"></div>

      <div className="text-base uppercase opacity-50 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={12} className="text-[var(--theme-color)]" />
          <span>Progresso de Metas</span>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="text-[var(--theme-color)] hover:text-white hover:bg-[var(--theme-color)]/20 border border-[var(--theme-color)]/30 px-1 py-0.5 text-base font-mono font-bold tracking-widest cursor-pointer uppercase flex items-center gap-0.5"
        >
          <Plus size={8} /> ADD_META
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddGoal} className="mb-3 p-2 bg-black/60 border border-[var(--theme-color)]/30 space-y-2">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="NOME DO OBJETIVO"
            className="w-full bg-[#0a1a2f]/40 border border-[var(--theme-color)]/20 p-1 text-base text-[var(--theme-color)] placeholder-[var(--theme-color)]/30 outline-none focus:border-[var(--theme-color)] font-mono"
          />
          <div className="flex gap-1.5">
            <input
              type="number"
              required
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="META R$"
              className="flex-1 bg-[#0a1a2f]/40 border border-[var(--theme-color)]/20 p-1 text-base text-[var(--theme-color)] placeholder-[var(--theme-color)]/30 outline-none focus:border-[var(--theme-color)] font-mono"
            />
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/20 p-1 text-base text-[var(--theme-color)] outline-none font-mono"
            >
              <option value="neon">CYAN</option>
              <option value="blue">AZUL</option>
              <option value="magenta">MAGENTA</option>
            </select>
            <button
              type="submit"
              className="bg-[var(--theme-color)]/20 border border-[var(--theme-color)] text-[var(--theme-color)] px-2 py-1 text-base font-mono font-bold hover:bg-[var(--theme-color)] hover:text-black cursor-pointer"
            >
              <Check size={10} />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {goals.map((goal) => {
          const percent = Math.min(100, Math.round((goal.current / goal.target) * 100));
          return (
            <div key={goal.id} className="space-y-1">
              <div className="flex justify-between items-center text-base font-mono">
                <span className={`font-bold ${getTextColorClass(goal.color)}`}>{goal.name}</span>
                <span className="text-white/60">
                  R$ {goal.current.toLocaleString('pt-BR')} / {goal.target.toLocaleString('pt-BR')} ({percent}%)
                </span>
              </div>
              <div className={`w-full h-1.5 bg-black/80 border ${getBorderColorClass(goal.color)} relative overflow-hidden rounded-none`}>
                <div 
                  className={`h-full transition-all duration-1000 ${getBarColorClass(goal.color)}`} 
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
