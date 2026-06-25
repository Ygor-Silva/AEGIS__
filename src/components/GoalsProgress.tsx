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
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', name: 'RESERVA DE EMERGÊNCIA', current: 20000, target: 25000, color: 'neon' },
    { id: '2', name: 'INVESTIMENTOS LP', current: 12000, target: 15000, color: 'blue' },
    { id: '3', name: 'FUNDO DE UPGRADES', current: 3500, target: 5000, color: 'magenta' },
  ]);

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
        return 'bg-[#00ffc2] shadow-[0_0_10px_#00ffc2]';
    }
  };

  const getBorderColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'border-[#00d4ff]/30';
      case 'magenta':
        return 'border-[#b000ff]/30';
      default:
        return 'border-[#00ffc2]/30';
    }
  };

  const getTextColorClass = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-[#00d4ff]';
      case 'magenta':
        return 'text-[#b000ff]';
      default:
        return 'text-[#00ffc2]';
    }
  };

  return (
    <div className="bg-[#0a1a2f]/40 border border-[#00ffc2]/10 p-3 flex flex-col mt-3 relative overflow-hidden">
      {/* Subtle background scanner just for context */}
      <div className="scanner-overlay-neon opacity-10"></div>

      <div className="text-[10px] uppercase opacity-50 mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target size={12} className="text-[#00ffc2]" />
          <span>Progresso de Metas</span>
        </div>
        <button 
          onClick={() => setShowAdd(!showAdd)} 
          className="text-[#00ffc2] hover:text-white hover:bg-[#00ffc2]/20 border border-[#00ffc2]/30 px-1 py-0.5 text-[8px] font-mono font-bold tracking-widest cursor-pointer uppercase flex items-center gap-0.5"
        >
          <Plus size={8} /> ADD_META
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleAddGoal} className="mb-3 p-2 bg-black/60 border border-[#00ffc2]/30 space-y-2">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="NOME DO OBJETIVO"
            className="w-full bg-[#0a1a2f]/40 border border-[#00ffc2]/20 p-1 text-[9px] text-[#00ffc2] placeholder-[#00ffc2]/30 outline-none focus:border-[#00ffc2] font-mono"
          />
          <div className="flex gap-1.5">
            <input
              type="number"
              required
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              placeholder="META R$"
              className="flex-1 bg-[#0a1a2f]/40 border border-[#00ffc2]/20 p-1 text-[9px] text-[#00ffc2] placeholder-[#00ffc2]/30 outline-none focus:border-[#00ffc2] font-mono"
            />
            <select
              value={newColor}
              onChange={(e) => setNewColor(e.target.value)}
              className="bg-[#0a1a2f]/40 border border-[#00ffc2]/20 p-1 text-[9px] text-[#00ffc2] outline-none font-mono"
            >
              <option value="neon">CYAN</option>
              <option value="blue">AZUL</option>
              <option value="magenta">MAGENTA</option>
            </select>
            <button
              type="submit"
              className="bg-[#00ffc2]/20 border border-[#00ffc2] text-[#00ffc2] px-2 py-1 text-[9px] font-mono font-bold hover:bg-[#00ffc2] hover:text-black cursor-pointer"
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
              <div className="flex justify-between items-center text-[9px] font-mono">
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
