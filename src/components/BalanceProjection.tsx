import React from 'react';
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';

export default function BalanceProjection() {
  const [currentBalance, projectedExpenses] = (() => {
    const savedExpenses = localStorage.getItem("kerdos_expenses");
    const savedIncomes = localStorage.getItem("kerdos_incomes");
    const savedOnboarding = localStorage.getItem("kerdos_onboarding_data");
    
    const expenses = savedExpenses ? JSON.parse(savedExpenses) : [];
    const incomes = savedIncomes ? JSON.parse(savedIncomes) : [];
    const onboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
    const baseIncome = onboarding ? parseFloat(onboarding.income) || 0 : 0;

    const totalIncome = baseIncome + incomes.reduce((sum: number, inc: any) => sum + (inc.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0);
    const current = totalIncome - totalExpenses;
    const projected = 0; // We could calculate avg daily expense
    return [current, projected];
  })();

  const projectedBalance = currentBalance - projectedExpenses;
  const isHealthy = projectedBalance > (currentBalance * 0.4);

  return (
    <div className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/10 p-3 flex flex-col mt-4">
      <div className="text-base uppercase opacity-50 mb-3 flex items-center gap-2">
        <AlertCircle size={12} className="text-[var(--theme-color)]" />
        Projeção de Saldo Mensal
      </div>
      
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="text-base text-white/40 uppercase mb-1">Saldo Atual</div>
          <div className="text-base font-mono">
            R$ {currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-base text-white/40 uppercase mb-1">Saídas Previstas</div>
          <div className="text-base font-mono text-[#ff0055]">
            - R$ {projectedExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className={`p-2 border ${isHealthy ? 'bg-[var(--theme-color)]/5 border-[var(--theme-color)]/30 text-[var(--theme-color)]' : 'bg-orange-500/5 border-orange-500/30 text-orange-500'} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          {isHealthy ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
          <div className="flex flex-col">
            <span className="text-base uppercase font-bold tracking-wider opacity-80">Estimativa Fim do Mês</span>
            <span className="text-base font-mono font-bold">
              R$ {projectedBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
        <div className="text-base uppercase tracking-wider opacity-70">
          {isHealthy ? 'ESTÁVEL' : 'ALERTA'}
        </div>
      </div>
    </div>
  );
}
