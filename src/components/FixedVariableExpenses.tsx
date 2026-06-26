import React, { useState } from 'react';
import { ShieldCheck, Flame, TrendingUp, AlertTriangle, HelpCircle, Layers, ToggleLeft, ToggleRight } from 'lucide-react';

interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  isFixed: boolean;
}

export default function FixedVariableExpenses() {
  const [allocationMode, setAllocationMode] = useState<'50-30-20' | '60-20-20' | '40-20-40'>('50-30-20');
  const [showTooltip, setShowTooltip] = useState(false);

  // Load user data
  const savedOnboarding = localStorage.getItem("kerdos_onboarding_data");
  const onboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
  const income = onboarding ? parseFloat(onboarding.income) || 5000 : 5000;

  // Modern Senior advisory rates based on selection
  // 50-30-20: 50% Fixas/Essenciais, 30% Variáveis/Estilo de Vida, 20% Investimentos
  // 60-20-20: 60% Fixas/Essenciais, 20% Variáveis/Estilo de Vida, 20% Investimentos (Ideal para capitais caras ou início)
  // 40-20-40: 40% Fixas/Essenciais, 20% Variáveis/Estilo de Vida, 40% Investimentos (Ideal para acelerar independência financeira)
  const limits = {
    '50-30-20': { fixedPct: 50, variablePct: 30, investPct: 20 },
    '60-20-20': { fixedPct: 60, variablePct: 20, investPct: 20 },
    '40-20-40': { fixedPct: 40, variablePct: 20, investPct: 40 },
  }[allocationMode];

  const fixedLimitValue = income * (limits.fixedPct / 100);
  const variableLimitValue = income * (limits.variablePct / 100);
  const investLimitValue = income * (limits.investPct / 100);

  // Simulated live breakdown from onboarding context
  const expenses: ExpenseItem[] = [
    { id: '1', name: 'MORADIA / ALUGUEL', amount: income * 0.25, category: 'Habitação', isFixed: true },
    { id: '2', name: 'PLANOS & ASSINATURAS', amount: income * 0.0476, category: 'Serviços', isFixed: true },
    { id: '3', name: 'SAÚDE & SEGUROS', amount: income * 0.06, category: 'Saúde', isFixed: true },
    { id: '4', name: 'SUPERMERCADO BASE', amount: income * 0.10125, category: 'Alimentação', isFixed: false },
    { id: '5', name: 'DELIVERIES & LAZER', amount: income * 0.083, category: 'Lazer', isFixed: false },
    { id: '6', name: 'APP DE TRANSPORTE (UBER)', amount: income * 0.05, category: 'Transporte', isFixed: false },
  ];

  const fixedExpenses = expenses.filter(e => e.isFixed);
  const variableExpenses = expenses.filter(e => !e.isFixed);

  const totalFixed = fixedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalVariable = variableExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const currentFixedPct = (totalFixed / income) * 100;
  const currentVariablePct = (totalVariable / income) * 100;
  const currentInvested = income - (totalFixed + totalVariable);
  const currentInvestedPct = (currentInvested / income) * 100;

  const getHealthStatus = (current: number, target: number) => {
    if (current > target) return { text: 'EXCEDIDO', color: 'text-red-500 border-red-500/30 bg-red-500/10' };
    if (current > target * 0.9) return { text: 'ALERTA', color: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10' };
    return { text: 'ESTÁVEL', color: 'text-[var(--theme-color)] border-[var(--theme-color)]/30 bg-[var(--theme-color)]/10' };
  };

  const fixedStatus = getHealthStatus(totalFixed, fixedLimitValue);
  const variableStatus = getHealthStatus(totalVariable, variableLimitValue);

  return (
    <div id="fixed-variable-section" className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/10 p-4 flex flex-col relative overflow-hidden transition-all duration-300">
      {/* Visual cyber borders */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[var(--theme-color)]"></div>
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[var(--theme-color)]"></div>
      
      {/* Title & Mode selector */}
      <div className="flex items-center justify-between mb-3 border-b border-[var(--theme-color)]/10 pb-2">
        <div className="flex items-center gap-2">
          <Layers className="text-[var(--theme-color)] animate-pulse" size={14} />
          <div>
            <h2 className="text-base font-bold tracking-widest text-[var(--theme-color)] uppercase font-mono">FIXAS VS. VARIÁVEIS</h2>
            <p className="text-base text-white/40 uppercase">Metodologias de Alocação Sênior</p>
          </div>
        </div>
        <div className="relative flex items-center gap-1.5">
          <button 
            onClick={() => setShowTooltip(!showTooltip)}
            className="text-white/40 hover:text-[var(--theme-color)] transition-colors"
            title="Sobre as regras de mercado"
          >
            <HelpCircle size={12} />
          </button>
          <select 
            value={allocationMode} 
            onChange={(e) => setAllocationMode(e.target.value as any)}
            className="bg-black/80 border border-[var(--theme-color)]/30 text-[var(--theme-color)] text-base font-mono p-1 rounded-sm outline-none focus:border-[var(--theme-color)] transition-colors cursor-pointer"
          >
            <option value="50-30-20">REGRA 50/30/20</option>
            <option value="60-20-20">REGRA 60/20/20</option>
            <option value="40-20-40">REGRA 40/20/40</option>
          </select>
        </div>
      </div>

      {/* Senior Advisory Explanation Tooltip */}
      {showTooltip && (
        <div className="bg-black/95 border border-[var(--theme-color)]/40 p-2.5 rounded-sm text-base text-[var(--theme-color)]/90 font-mono mb-3 leading-relaxed relative animate-fadeIn">
          <div className="font-bold text-white mb-1 uppercase">ESTRUTURA SUGERIDA PELO AGENTE SÊNIOR:</div>
          - <span className="text-[#00d4ff] font-bold">50% Fixas/Essenciais:</span> Custos de sobrevivência estrutural indispensáveis. Se ultrapassar, sua estrutura de vida está cara demais.<br/>
          - <span className="text-purple-400 font-bold">30% Variáveis/Estilo de Vida:</span> Gastos flexíveis que dão sabor à vida. Devem ser fáceis de cortar em emergências.<br/>
          - <span className="text-[var(--theme-color)] font-bold">20% Futuro/Investimentos:</span> Reserva de emergência, longo prazo e previdência.<br/>
          <div className="mt-1.5 text-base text-white/40 italic">As outras opções adaptam a alocação para momentos de contenção severa (60/20/20) ou enriquecimento agressivo (40/20/40).</div>
        </div>
      )}

      {/* Quick Visual Gauges */}
      <div className="grid grid-cols-3 gap-2.5 mb-4 text-center">
        {/* Fixed Gauge */}
        <div className="border border-[var(--theme-color)]/10 bg-black/30 p-1.5 flex flex-col justify-between">
          <span className="text-base text-white/50 block font-mono">ESSENCIAIS (FIXAS)</span>
          <div className="my-1">
            <span className="text-base font-mono font-bold text-white">R$ {totalFixed.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
            <span className="text-base text-white/40 block">Teto: R$ {fixedLimitValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="w-full bg-[var(--theme-color)]/10 h-1.5 relative overflow-hidden rounded-full">
            <div 
              className={`h-full transition-all duration-500 ${currentFixedPct > limits.fixedPct ? 'bg-red-500' : 'bg-[var(--theme-color)]'}`}
              style={{ width: `${Math.min(100, (totalFixed / fixedLimitValue) * 100)}%` }}
            ></div>
          </div>
          <span className={`text-base font-mono font-bold uppercase mt-1 px-1 border rounded-[2px] block mx-auto py-0.5 ${fixedStatus.color}`}>
            {fixedStatus.text} ({Math.round(currentFixedPct)}%)
          </span>
        </div>

        {/* Variable Gauge */}
        <div className="border border-[var(--theme-color)]/10 bg-black/30 p-1.5 flex flex-col justify-between">
          <span className="text-base text-white/50 block font-mono">ESTILO DE VIDA (VAR)</span>
          <div className="my-1">
            <span className="text-base font-mono font-bold text-white">R$ {totalVariable.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
            <span className="text-base text-white/40 block">Teto: R$ {variableLimitValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="w-full bg-[var(--theme-color)]/10 h-1.5 relative overflow-hidden rounded-full">
            <div 
              className={`h-full transition-all duration-500 ${currentVariablePct > limits.variablePct ? 'bg-red-500' : 'bg-purple-500'}`}
              style={{ width: `${Math.min(100, (totalVariable / variableLimitValue) * 100)}%` }}
            ></div>
          </div>
          <span className={`text-base font-mono font-bold uppercase mt-1 px-1 border rounded-[2px] block mx-auto py-0.5 ${variableStatus.color}`}>
            {variableStatus.text} ({Math.round(currentVariablePct)}%)
          </span>
        </div>

        {/* Investments Gauge */}
        <div className="border border-[var(--theme-color)]/10 bg-black/30 p-1.5 flex flex-col justify-between">
          <span className="text-base text-white/50 block font-mono">CAPITAL LIVRE/INV</span>
          <div className="my-1">
            <span className="text-base font-mono font-bold text-[var(--theme-color)]">R$ {currentInvested.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
            <span className="text-base text-white/40 block">Meta: R$ {investLimitValue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="w-full bg-[var(--theme-color)]/10 h-1.5 relative overflow-hidden rounded-full">
            <div 
              className="h-full bg-blue-500 transition-all duration-500"
              style={{ width: `${Math.min(100, (currentInvested / investLimitValue) * 100)}%` }}
            ></div>
          </div>
          <span className="text-base font-mono font-bold uppercase mt-1 px-1 border border-blue-500/30 bg-blue-500/10 text-blue-400 block mx-auto py-0.5">
            INV ({Math.round(currentInvestedPct)}%)
          </span>
        </div>
      </div>

      {/* List detailing items grouped by Type */}
      <div className="space-y-3 font-mono text-sm">
        {/* Fixed Group */}
        <div>
          <div className="flex justify-between items-center bg-[var(--theme-color)]/5 px-2 py-1 border-l-2 border-[var(--theme-color)] mb-1.5">
            <span className="font-bold text-white/80 uppercase">DESPESAS FIXAS (SOBREVIVÊNCIA)</span>
            <span className="text-[var(--theme-color)] font-bold">R$ {totalFixed.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="space-y-1 pl-1">
            {fixedExpenses.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-white/70 hover:text-white transition-colors py-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-[var(--theme-color)] rounded-full"></span>
                  {item.name}
                  <span className="text-base opacity-45 px-1 bg-white/5 rounded-sm">{item.category}</span>
                </span>
                <span>R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Variable Group */}
        <div>
          <div className="flex justify-between items-center bg-purple-500/5 px-2 py-1 border-l-2 border-purple-500 mb-1.5">
            <span className="font-bold text-white/80 uppercase">DESPESAS VARIÁVEIS (LIFESTYLE)</span>
            <span className="text-purple-400 font-bold">R$ {totalVariable.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="space-y-1 pl-1">
            {variableExpenses.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-white/70 hover:text-white transition-colors py-0.5">
                <span className="flex items-center gap-1">
                  <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                  {item.name}
                  <span className="text-base opacity-45 px-1 bg-white/5 rounded-sm">{item.category}</span>
                </span>
                <span>R$ {item.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Smart Advisory message */}
      <div className="mt-3.5 pt-2 border-t border-[var(--theme-color)]/10 flex items-start gap-2 text-base text-white/60 leading-tight">
        {currentFixedPct > limits.fixedPct ? (
          <>
            <AlertTriangle size={13} className="text-red-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-red-400 uppercase">Ação Recomendada:</strong> Suas despesas fixas ({Math.round(currentFixedPct)}%) excedem a recomendação {limits.fixedPct}%. Recomenda-se renegociar contratos de planos/assinaturas ou otimizar custos básicos de moradia.
            </p>
          </>
        ) : currentVariablePct > limits.variablePct ? (
          <>
            <Flame size={13} className="text-purple-400 shrink-0 mt-0.5" />
            <p>
              <strong className="text-purple-400 uppercase">Ação Recomendada:</strong> Lazer e deliveries ({Math.round(currentVariablePct)}%) superam a meta de {limits.variablePct}%. Considere estipular um teto semanal para o final de semana no Terminal de Comando.
            </p>
          </>
        ) : (
          <>
            <ShieldCheck size={13} className="text-[var(--theme-color)] shrink-0 mt-0.5" />
            <p>
              <strong className="text-[var(--theme-color)] uppercase">Estrutura Otimizada:</strong> Alocações em perfeita harmonia com os padrões sênior mais atuais do mercado financeiro de capitais. Parabéns pelo autocontrole, operador.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
