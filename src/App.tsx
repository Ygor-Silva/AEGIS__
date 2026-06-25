import React, { useState } from "react";
import ChatInterface from "./components/ChatInterface";
import SpendingTrendChart from "./components/SpendingTrendChart";
import { HelpCircle, LogOut } from "lucide-react";

import QuickEntryForm from "./components/QuickEntryForm";
import ToastContainer from "./components/Toast";
import FinancialSummary from "./components/FinancialSummary";
import LoginScreen from "./components/LoginScreen";
import BalanceProjection from "./components/BalanceProjection";
import OnboardingModal from "./components/OnboardingModal";
import QuickActions from "./components/QuickActions";
import AiInsights from "./components/AiInsights";
import GoalsProgress from "./components/GoalsProgress";
import SystemTutorial from "./components/SystemTutorial";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("aegis_authenticated") === "true";
  });
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return localStorage.getItem("aegis_onboarding_complete") === "true";
  });
  const [onboardingData, setOnboardingData] = useState(() => {
    const saved = localStorage.getItem("aegis_onboarding_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem("aegis_tutorial_complete") !== "true";
  });

  const handleLogout = () => {
    sessionStorage.removeItem("aegis_authenticated");
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={() => {
          sessionStorage.setItem("aegis_authenticated", "true");
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="h-full w-full bg-[#020408] text-[#00ffc2] font-mono overflow-hidden relative border-4 border-[#0a1a2f]">
      {/* Background Gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, #00ffc2 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#00d4ff_0%,_transparent_50%)] pointer-events-none"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-8 py-4 border-b border-[#00ffc2]/30 bg-[#000]/40 backdrop-blur-md relative z-10">
        <div className="flex items-center space-x-4">
          <img src="/src/assets/images/aegis_logo_1782329274884.jpg" alt="Logo" className="w-10 h-10 border-2 border-[#00ffc2] rounded-full object-cover shadow-[0_0_15px_#00ffc240]" />
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase italic">A.E.G.I.S.</h1>
            <p className="text-[10px] opacity-70 tracking-widest">SISTEMA DE GESTÃO E INTELIGÊNCIA DE SALDOS</p>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-right">
          <button
            onClick={() => setShowTutorial(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#00ffc2]/50 text-[#00ffc2] hover:bg-[#00ffc2]/20 transition-all cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider"
            title="Iniciar Tutorial"
          >
            <HelpCircle size={14} />
            <span>AJUDA</span>
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-[#ff0055]/50 text-[#ff0055] hover:bg-[#ff0055]/20 transition-all cursor-pointer font-mono text-[10px] font-bold uppercase tracking-wider"
            title="Desconectar Sessão"
          >
            <LogOut size={14} />
            <span>SAIR</span>
          </button>
        </div>
      </header>

      {/* Main Grid Content */}
      <main className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 relative z-10 h-[calc(100%-80px)] overflow-hidden">
        {/* Left Aside - Decorative HUD */}
        <aside className="hidden md:flex col-span-3 flex-col gap-4 h-full overflow-y-auto pr-1 pb-12 scrollbar-none">
          <div className="bg-[#0a1a2f]/60 border border-[#00ffc2]/20 p-4 backdrop-blur-xl relative shrink-0">
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#00ffc2]"></div>
            <div className="text-[10px] uppercase opacity-50 mb-2">Patrimônio Total</div>
            <div className="text-3xl font-bold tracking-tight text-white mb-1">R$ 42.890,12</div>
            <div className="text-[10px] text-[#00d4ff] flex items-center">
              <span>▲ 12.4% ESTE MÊS</span>
            </div>
          </div>
          <GoalsProgress />
          <FinancialSummary />
          <SpendingTrendChart />
        </aside>

        {/* Center Section - Chat Interface */}
        <section className="col-span-1 md:col-span-6 flex flex-col h-full bg-[#0a1a2f]/80 border border-[#00ffc2]/40 rounded-sm relative overflow-hidden shadow-[inset_0_0_50px_rgba(0,255,194,0.05)]">
          <div className="absolute inset-0 border-[20px] border-transparent opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #00ffc2 0, #00ffc2 1px, transparent 0, transparent 20px)" }}></div>
          <div className="bg-[#00ffc2]/10 px-4 py-2 border-b border-[#00ffc2]/20 flex justify-between items-center relative z-10">
            <div className="text-[11px] font-bold tracking-widest uppercase">Terminal Principal</div>
            <div className="text-[10px] font-mono">COM_LINK: ACTIVE</div>
          </div>
          
          {/* Chat Component */}
          <div className="flex-1 relative z-10 h-full overflow-hidden">
            <ChatInterface />
          </div>
        </section>

        {/* Right Aside - Decorative HUD */}
        <aside className="hidden md:flex col-span-3 flex-col gap-4 h-full overflow-y-auto pr-1 pb-12 scrollbar-none">
          <AiInsights />
          <BalanceProjection />
          <QuickEntryForm />
          <div className="h-32 bg-black border border-[#00ffc2]/20 p-3 overflow-hidden shrink-0">
            <div className="text-[8px] font-mono opacity-40 uppercase mb-2">Logs do Sistema v4.0.2</div>
            <div className="text-[9px] font-mono space-y-1 leading-none">
              <div className="text-blue-400">&gt; SQL_QUERY: RECENT_EXPENSES</div>
              <div className="text-green-400">&gt; CACHE_HIT: 99.8%</div>
              <div className="text-white">&gt; AEGIS_CORE: READY_FOR_CMD</div>
              <div className="text-red-400">&gt; WARN: INFLATION_INDEX_ADJ</div>
              <div className="text-blue-400">&gt; SYNCING_CLOUD_DATA...</div>
            </div>
          </div>
        </aside>
      </main>

      <footer className="absolute bottom-4 left-6 right-6 flex items-center justify-between pointer-events-none z-10 hidden md:flex">
        <div className="text-[9px] font-bold tracking-[0.2em] opacity-30">DESIGNED FOR EXCELLENCE // PROTOCOL 77-B</div>
        <div className="flex space-x-2">
          <div className="w-1 h-1 bg-[#00ffc2]"></div>
          <div className="w-1 h-1 bg-[#00ffc2]"></div>
          <div className="w-10 h-1 bg-[#00ffc2]/20"></div>
        </div>
      </footer>
      <QuickActions 
        onLogout={handleLogout} 
        onOpenProfile={() => setShowProfileModal(true)} 
        onOpenSettings={() => setShowSettingsModal(true)}
      />
      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      {(!isOnboardingComplete || showProfileModal) && (
        <OnboardingModal 
          initialData={onboardingData}
          onComplete={(data) => {
            localStorage.setItem("aegis_onboarding_complete", "true");
            localStorage.setItem("aegis_onboarding_data", JSON.stringify(data));
            setIsOnboardingComplete(true);
            setOnboardingData(data);
            setShowProfileModal(false);
          }} 
        />
      )}
      {showTutorial && (
        <SystemTutorial onClose={() => setShowTutorial(false)} />
      )}
      <ToastContainer />
    </div>
  );
}
