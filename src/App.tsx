import React, { useState } from "react";
import { Menu, X, User, Settings as SettingsIcon, HelpCircle, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ChatInterface from "./components/ChatInterface";
import Sidebar from "./components/Sidebar";
import SmartDashboard from "./components/SmartDashboard";
import ToastContainer from "./components/Toast";
import LoginScreen from "./components/LoginScreen";
import OnboardingModal from "./components/OnboardingModal";
import AiInsights from "./components/AiInsights";
import MarketNews from "./components/MarketNews";
import FinancialTip from "./components/FinancialTip";
import SystemTutorial from "./components/SystemTutorial";
import SettingsModal from "./components/SettingsModal";
import logoUrl from "./assets/images/kerdos_logo_1782476296342.jpg";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("kerdos_authenticated") === "true";
  });
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(() => {
    return localStorage.getItem("kerdos_onboarding_complete") === "true";
  });
  const [onboardingData, setOnboardingData] = useState(() => {
    const saved = localStorage.getItem("kerdos_onboarding_data");
    return saved ? JSON.parse(saved) : null;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => {
    return localStorage.getItem("kerdos_tutorial_complete") !== "true";
  });
  
  // Mobile / Desktop View State
  const [activeTab, setActiveTab] = useState<'chat' | 'dashboard'>('chat');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  React.useEffect(() => {
    const theme = localStorage.getItem("kerdos_theme") || "neon";
    document.body.className = `theme-${theme}`;
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem("kerdos_authenticated");
    setIsAuthenticated(false);
  };

  const incomeNum = onboardingData ? parseFloat(onboardingData.income) || 5000 : 5000;
  const totalAssets = incomeNum * 8.578024;

  if (!isAuthenticated) {
    return (
      <LoginScreen 
        onLogin={() => {
          sessionStorage.setItem("kerdos_authenticated", "true");
          setIsAuthenticated(true);
        }} 
      />
    );
  }

  return (
    <div className="h-full w-full flex bg-[#020408] text-[var(--theme-color)] font-mono overflow-hidden relative border-4 border-[#0a1a2f]">
      {/* Background Gradients */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 50% 50%, var(--theme-color) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_#00d4ff_0%,_transparent_50%)] pointer-events-none"></div>

      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        logoUrl={logoUrl}
        onLogout={handleLogout}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenTutorial={() => setShowTutorial(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[var(--theme-color)]/30 bg-[#000]/40 backdrop-blur-md relative z-50">
          <div className="flex items-center space-x-3">
            <img src={logoUrl} alt="Logo" className="w-8 h-8 border border-[var(--theme-color)] rounded-full object-cover" />
            <h1 className="text-xl font-black tracking-tighter uppercase italic">KERDOS</h1>
          </div>
          <div className="flex space-x-2">
             <button onClick={() => setActiveTab('chat')} className={`p-2 rounded-lg ${activeTab === 'chat' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50'}`}>💬</button>
             <button onClick={() => setActiveTab('dashboard')} className={`p-2 rounded-lg ${activeTab === 'dashboard' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50'}`}>📊</button>
             <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="p-2 rounded-lg text-white/50 hover:text-[var(--theme-color)]">
               {showMobileMenu ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="absolute top-full right-0 left-0 bg-[#0a1a2f]/95 border-b border-[var(--theme-color)]/30 backdrop-blur-xl p-4 flex flex-col gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
              <button 
                onClick={() => { setShowProfileModal(true); setShowMobileMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-lg text-white hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 transition-colors"
              >
                <User size={18} />
                <span className="font-bold tracking-wider uppercase text-sm">Perfil</span>
              </button>
              <button 
                onClick={() => { setShowTutorial(true); setShowMobileMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-lg text-white hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 transition-colors"
              >
                <HelpCircle size={18} />
                <span className="font-bold tracking-wider uppercase text-sm">Tutorial</span>
              </button>
              <button 
                onClick={() => { setShowSettingsModal(true); setShowMobileMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-lg text-white hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10 transition-colors"
              >
                <SettingsIcon size={18} />
                <span className="font-bold tracking-wider uppercase text-sm">Configurações</span>
              </button>
              <button 
                onClick={() => { handleLogout(); setShowMobileMenu(false); }}
                className="flex items-center gap-3 p-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors mt-2 border-t border-red-500/20"
              >
                <LogOut size={18} />
                <span className="font-bold tracking-wider uppercase text-sm">Desconectar</span>
              </button>
            </div>
          )}
        </header>

        <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' ? (
              <motion.section 
                key="chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col flex-1 bg-[#0a1a2f]/80 border border-[var(--theme-color)]/40 rounded-xl overflow-hidden shadow-[inset_0_0_50px_rgba(0,255,194,0.05)]"
              >
                <div className="absolute inset-0 border-[20px] border-transparent opacity-10 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, var(--theme-color) 0, var(--theme-color) 1px, transparent 0, transparent 20px)" }}></div>
                <div className="bg-[var(--theme-color)]/10 px-4 py-3 border-b border-[var(--theme-color)]/20 flex justify-between items-center relative z-10 shrink-0">
                  <div className="text-base font-bold tracking-widest uppercase">Terminal de Comando</div>
                  <div className="text-base font-mono text-[var(--theme-color)] flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[var(--theme-color)] animate-pulse"></span>
                    COM_LINK: ACTIVE
                  </div>
                </div>
                
                {/* Quick Insights & Metrics for Terminal */}
                <div className="relative z-10 flex flex-col xl:flex-row gap-4 p-4 border-b border-[var(--theme-color)]/20 bg-black/40 shrink-0">
                   <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-[140px] max-h-[300px] xl:max-h-[180px]">
                     <div className="flex-1 min-h-[120px] overflow-hidden">
                       <AiInsights />
                     </div>
                     <div className="flex-1 min-h-[120px] overflow-hidden">
                       <MarketNews />
                     </div>
                   </div>
                   <div className="flex flex-row gap-3 shrink-0 overflow-x-auto scrollbar-none pb-2 xl:pb-0">
                      <div className="bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg flex flex-col justify-center min-w-[140px]">
                         <span className="text-xs font-bold text-white/50 uppercase mb-1">Saúde Financeira</span>
                         <span className="text-sm font-black text-[var(--theme-color)] flex items-center gap-1">
                           <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-color)] animate-pulse"></span>
                           ESTÁVEL
                         </span>
                      </div>
                      <div className="bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg flex flex-col justify-center min-w-[140px]">
                         <span className="text-xs font-bold text-white/50 uppercase mb-1">Patrimônio Atual</span>
                         <span className="text-sm font-black text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(incomeNum * 8.578024)}</span>
                      </div>
                      <div className="bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 p-3 rounded-lg flex flex-col justify-center min-w-[140px]">
                         <span className="text-xs font-bold text-white/50 uppercase mb-1">Saldo em Caixa</span>
                         <span className="text-sm font-black text-[var(--theme-color)]">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format((incomeNum + (incomeNum * 0.038)) - (incomeNum * 0.456))}</span>
                      </div>
                   </div>
                </div>

                <div className="flex-1 relative z-10 overflow-hidden">
                  <ChatInterface />
                </div>
              </motion.section>
            ) : (
              <motion.aside 
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="h-full flex flex-col gap-4 w-full flex-1 overflow-y-auto scrollbar-none"
              >
                <div className="flex-1 min-h-[500px] flex flex-col xl:flex-row gap-4">
                  <div className="flex-1">
                    <SmartDashboard income={incomeNum} />
                  </div>
                  <div className="w-full xl:w-80 shrink-0 flex flex-col">
                    <FinancialTip />
                  </div>
                </div>
                <div className="h-28 bg-black/60 border border-[var(--theme-color)]/20 p-3 overflow-hidden shrink-0 rounded-xl backdrop-blur-md">
                  <div className="text-base font-mono opacity-50 uppercase mb-2">Logs do Sistema v4.0.2</div>
                  <div className="text-base font-mono space-y-1.5 leading-none">
                    <div className="text-blue-400">&gt; SQL_QUERY: RECENT_EXPENSES</div>
                    <div className="text-green-400">&gt; CACHE_HIT: 99.8%</div>
                    <div className="text-white">&gt; KERDOS_CORE: READY_FOR_CMD</div>
                    <div className="text-blue-400">&gt; SYNCING_CLOUD_DATA...</div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      </main>

      <footer className="absolute bottom-4 left-24 right-6 flex items-center justify-between pointer-events-none z-10 hidden md:flex">
        <div className="text-base font-bold tracking-[0.2em] opacity-30">DESIGNED FOR EXCELLENCE // PROTOCOL 77-B</div>
        <div className="flex space-x-2">
          <div className="w-1.5 h-1.5 bg-[var(--theme-color)]"></div>
          <div className="w-1.5 h-1.5 bg-[var(--theme-color)]"></div>
          <div className="w-12 h-1.5 bg-[var(--theme-color)]/20"></div>
        </div>
      </footer>

      {showSettingsModal && (
        <SettingsModal onClose={() => setShowSettingsModal(false)} />
      )}
      {(!isOnboardingComplete || showProfileModal) && (
        <OnboardingModal 
          initialData={onboardingData}
          onClose={isOnboardingComplete ? () => setShowProfileModal(false) : undefined}
          onComplete={(data) => {
            localStorage.setItem("kerdos_onboarding_complete", "true");
            localStorage.setItem("kerdos_onboarding_data", JSON.stringify(data));
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

