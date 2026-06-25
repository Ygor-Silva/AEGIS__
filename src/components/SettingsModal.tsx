import React, { useState, useEffect } from "react";
import { X, Shield, Eye, EyeOff, Cpu, DollarSign, Target, Save } from "lucide-react";
import { motion } from "motion/react";
import { emitToast } from "./Toast";

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [model, setModel] = useState("openrouter/auto");
  const [customModel, setCustomModel] = useState("");
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [currency, setCurrency] = useState("BRL");
  const [budgetLimit, setBudgetLimit] = useState("3500");

  // Load saved values on mount
  useEffect(() => {
    const savedKey = localStorage.getItem("openrouter_api_key") || "";
    const savedModel = localStorage.getItem("openrouter_model") || "openrouter/auto";
    const savedCurrency = localStorage.getItem("aegis_currency") || "BRL";
    const savedLimit = localStorage.getItem("aegis_monthly_limit") || "3500";

    setApiKey(savedKey);
    setCurrency(savedCurrency);
    setBudgetLimit(savedLimit);

    const standardModels = [
      "openrouter/auto",
      "google/gemini-2.5-flash",
      "google/gemini-2.5-pro",
      "deepseek/deepseek-chat",
      "meta-llama/llama-3-8b-instruct:free",
      "mistralai/mistral-7b-instruct:free"
    ];

    if (standardModels.includes(savedModel)) {
      setModel(savedModel);
      setIsCustomModel(false);
    } else if (savedModel) {
      setModel("custom");
      setCustomModel(savedModel);
      setIsCustomModel(true);
    }
  }, []);

  const handleModelChange = (val: string) => {
    setModel(val);
    if (val === "custom") {
      setIsCustomModel(true);
    } else {
      setIsCustomModel(false);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const finalModel = isCustomModel ? customModel.trim() : model;

    localStorage.setItem("openrouter_api_key", apiKey.trim());
    localStorage.setItem("openrouter_model", finalModel);
    localStorage.setItem("aegis_currency", currency);
    localStorage.setItem("aegis_monthly_limit", budgetLimit);

    emitToast("⚙️ CONFIGURAÇÕES ATUALIZADAS COM SUCESSO!", "success");
    
    // Trigger callback or window refresh to apply updates
    setTimeout(() => {
      window.location.reload();
    }, 1000);

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-lg bg-[#020408] border-2 border-[var(--theme-color)] p-6 relative overflow-hidden shadow-[0_0_50px_rgba(var(--theme-color-rgb),0.15)] font-mono text-[var(--theme-color)]"
      >
        {/* Holographic matrix line decoration */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[var(--theme-color)] to-transparent animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(var(--theme-color-rgb),0.03)_0%,_transparent_60%)] pointer-events-none" />

        <div className="flex items-center justify-between border-b border-[var(--theme-color)]/30 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Shield size={18} className="animate-pulse text-[var(--theme-color)]" />
            <span className="text-base font-black tracking-[0.2em] uppercase text-white">
              PAINEL DE CONFIGURAÇÕES A.E.G.I.S.
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--theme-color)]/60 hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 p-1.5 transition-colors cursor-pointer"
            id="close-settings-btn"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Section: OpenRouter API Config */}
          <div className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/20 p-4 relative">
            <div className="text-base uppercase text-[#00d4ff] font-bold mb-3 tracking-widest flex items-center gap-1.5">
              <Cpu size={12} />
              Integração de Inteligência Artificial (OpenRouter)
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-base uppercase tracking-wider text-[var(--theme-color)]/70 mb-1">
                  Chave API OpenRouter
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="w-full bg-black border border-[var(--theme-color)]/30 p-2 pr-10 text-base text-[var(--theme-color)] focus:border-[var(--theme-color)] outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 text-[var(--theme-color)]/60 hover:text-[var(--theme-color)]"
                  >
                    {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
                <p className="text-base text-[var(--theme-color)]/40 mt-1 uppercase leading-tight">
                  Sua chave fica gravada localmente no navegador e nunca é exposta publicamente. Se vazia, o sistema usará o Gemini local do backend.
                </p>
              </div>

              <div>
                <label className="block text-base uppercase tracking-wider text-[var(--theme-color)]/70 mb-1">
                  Modelo LLM Principal
                </label>
                <select
                  value={model}
                  onChange={(e) => handleModelChange(e.target.value)}
                  className="w-full bg-black border border-[var(--theme-color)]/30 p-2 text-base text-[var(--theme-color)] outline-none focus:border-[var(--theme-color)] cursor-pointer"
                >
                  <option value="openrouter/auto">Automático / Recomendado (Rápido)</option>
                  <option value="google/gemini-2.5-flash">Google Gemini 2.5 Flash</option>
                  <option value="google/gemini-2.5-pro">Google Gemini 2.5 Pro (Mais Inteligente)</option>
                  <option value="deepseek/deepseek-chat">DeepSeek V3 (Excelente Orçamento)</option>
                  <option value="meta-llama/llama-3-8b-instruct:free">Meta Llama 3 8B (Grátis)</option>
                  <option value="mistralai/mistral-7b-instruct:free">Mistral 7B (Grátis)</option>
                  <option value="custom">Outro Modelo (Digitar ID do OpenRouter)</option>
                </select>
              </div>

              {isCustomModel && (
                <div className="mt-2">
                  <label className="block text-base uppercase tracking-wider text-[var(--theme-color)]/70 mb-1">
                    ID do Modelo Customizado
                  </label>
                  <input
                    type="text"
                    value={customModel}
                    onChange={(e) => setCustomModel(e.target.value)}
                    placeholder="ex: anthropic/claude-3-haiku"
                    className="w-full bg-black border border-[var(--theme-color)]/30 p-2 text-base text-[var(--theme-color)] focus:border-[var(--theme-color)] outline-none"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section: Financial & Interface Preferences */}
          <div className="bg-[#0a1a2f]/40 border border-[var(--theme-color)]/20 p-4 relative">
            <div className="text-base uppercase text-[#b000ff] font-bold mb-3 tracking-widest flex items-center gap-1.5">
              <DollarSign size={12} />
              Preferências Financeiras e Interface
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-base uppercase tracking-wider text-[var(--theme-color)]/70 mb-1">
                  Moeda Padrão
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-black border border-[var(--theme-color)]/30 p-2 text-base text-[var(--theme-color)] outline-none focus:border-[var(--theme-color)] cursor-pointer"
                >
                  <option value="BRL">Real Brasileiro (R$)</option>
                  <option value="USD">Dólar Americano ($)</option>
                  <option value="EUR">Euro (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-base uppercase tracking-wider text-[var(--theme-color)]/70 mb-1">
                  Tema da Interface
                </label>
                <select
                  value={localStorage.getItem("aegis_theme") || "neon"}
                  onChange={(e) => localStorage.setItem("aegis_theme", e.target.value)}
                  className="w-full bg-black border border-[var(--theme-color)]/30 p-2 text-base text-[var(--theme-color)] outline-none focus:border-[var(--theme-color)] cursor-pointer"
                >
                  <option value="neon">Neon Green (Padrão)</option>
                  <option value="amber">Cyber Amber</option>
                  <option value="blue">Deep Blue</option>
                  <option value="violet">Hyper Violet</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-base uppercase tracking-wider text-[var(--theme-color)]/70 mb-1">
                  Meta de Gastos Mensal
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-2 text-base opacity-50">
                    {currency === "BRL" ? "R$" : currency === "EUR" ? "€" : "$"}
                  </span>
                  <input
                    type="number"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    placeholder="3500"
                    className="w-full bg-black border border-[var(--theme-color)]/30 p-2 pl-8 text-base text-[var(--theme-color)] focus:border-[var(--theme-color)] outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Save / Footer */}
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 text-base font-bold uppercase tracking-wider cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[var(--theme-color)] text-black hover:bg-white hover:shadow-[0_0_15px_rgba(255,255,255,0.4)] text-base font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Save size={13} />
              Salvar Alterações
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
