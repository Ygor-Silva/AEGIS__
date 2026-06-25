import React, { useState } from 'react';
import { ShieldAlert, ChevronRight } from 'lucide-react';
import { emitToast } from './Toast';

interface OnboardingModalProps {
  onComplete: (data: { income: string; goal: string; risk: string; age: string }) => void;
  initialData?: { income: string; goal: string; risk: string; age: string } | null;
}

export default function OnboardingModal({ onComplete, initialData }: OnboardingModalProps) {
  const [income, setIncome] = useState(initialData?.income || '');
  const [goal, setGoal] = useState(initialData?.goal || '');
  const [risk, setRisk] = useState(initialData?.risk || '');
  const [age, setAge] = useState(initialData?.age || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!income || !goal || !risk || !age) {
      emitToast('Todos os campos são obrigatórios para a calibração.', 'error');
      return;
    }
    emitToast('Perfil financeiro calibrado com sucesso.', 'success');
    onComplete({ income, goal, risk, age });
  };

  return (
    <div className="fixed inset-0 z-[150] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0a1a2f] border border-[#00ffc2] p-6 max-w-md w-full relative overflow-hidden shadow-[0_0_30px_rgba(0,255,194,0.15)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00ffc2] to-transparent"></div>
        
        <div className="flex items-center gap-3 mb-6 border-b border-[#00ffc2]/20 pb-4">
          <ShieldAlert className="text-[#00ffc2]" size={24} />
          <div>
            <h2 className="text-[#00ffc2] font-black tracking-widest uppercase text-lg">Calibração Inicial</h2>
            <p className="text-[#00ffc2]/60 text-[10px] uppercase tracking-widest">Requerido para atuação como Assessor Financeiro</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase text-[#00ffc2]/70 mb-1">Renda Mensal Estimada (R$)</label>
            <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full bg-black/50 border border-[#00ffc2]/30 p-2 text-sm text-[#00ffc2] outline-none focus:border-[#00ffc2] font-mono" placeholder="Ex: 5000" />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#00ffc2]/70 mb-1">Idade do Operador</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} className="w-full bg-black/50 border border-[#00ffc2]/30 p-2 text-sm text-[#00ffc2] outline-none focus:border-[#00ffc2] font-mono" placeholder="Ex: 30" />
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#00ffc2]/70 mb-1">Objetivo Principal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-black/50 border border-[#00ffc2]/30 p-2 text-sm text-[#00ffc2] outline-none focus:border-[#00ffc2] font-mono appearance-none">
              <option value="">SELECIONE UM OBJETIVO</option>
              <option value="reserva">Criar Reserva de Emergência</option>
              <option value="aposentadoria">Aposentadoria</option>
              <option value="imovel">Comprar Imóvel/Veículo</option>
              <option value="viagem">Viagem/Lazer</option>
              <option value="investimentos">Maximizar Investimentos</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase text-[#00ffc2]/70 mb-1">Tolerância a Risco</label>
            <select value={risk} onChange={e => setRisk(e.target.value)} className="w-full bg-black/50 border border-[#00ffc2]/30 p-2 text-sm text-[#00ffc2] outline-none focus:border-[#00ffc2] font-mono appearance-none">
              <option value="">SELECIONE O PERFIL</option>
              <option value="conservador">Conservador (Prioriza Segurança)</option>
              <option value="moderado">Moderado (Equilíbrio)</option>
              <option value="arrojado">Arrojado (Prioriza Rentabilidade)</option>
            </select>
          </div>

          <button type="submit" className="w-full mt-6 py-3 bg-[#00ffc2]/10 border border-[#00ffc2] text-[#00ffc2] hover:bg-[#00ffc2] hover:text-black transition-all uppercase tracking-widest font-bold text-xs flex justify-center items-center gap-2">
            Confirmar Calibração <ChevronRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
