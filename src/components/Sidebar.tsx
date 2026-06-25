import React from 'react';
import { MessageSquare, LayoutDashboard, Target, Activity, LogOut, Settings, HelpCircle, User } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenProfile: () => void;
  activeTab: 'chat' | 'dashboard';
  setActiveTab: (tab: 'chat' | 'dashboard') => void;
  logoUrl: string;
}

export default function Sidebar({ onLogout, onOpenSettings, onOpenTutorial, onOpenProfile, activeTab, setActiveTab, logoUrl }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-20 h-full border-r border-[var(--theme-color)]/30 bg-[#000]/80 backdrop-blur-md relative z-20 shrink-0">
      <div className="p-4 flex justify-center items-center border-b border-[var(--theme-color)]/20">
        <img src={logoUrl} alt="Logo" className="w-12 h-12 border-2 border-[var(--theme-color)] rounded-full object-cover shadow-[0_0_15px_var(--theme-color)40]" />
      </div>

      <nav className="flex-1 flex flex-col items-center py-6 space-y-8">
        <button 
          onClick={() => setActiveTab('chat')}
          className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'chat' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10'}`}
          title="Terminal (Chat)"
        >
          <MessageSquare size={24} />
          {activeTab === 'chat' && <span className="absolute -left-1 top-2 bottom-2 w-1 bg-[var(--theme-color)] rounded-r-md shadow-[0_0_10px_var(--theme-color)]" />}
        </button>

        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10'}`}
          title="Dashboard Financeiro"
        >
          <LayoutDashboard size={24} />
          {activeTab === 'dashboard' && <span className="absolute -left-1 top-2 bottom-2 w-1 bg-[var(--theme-color)] rounded-r-md shadow-[0_0_10px_var(--theme-color)]" />}
        </button>

        <button 
          onClick={onOpenProfile}
          className="relative p-3 rounded-xl transition-all duration-300 group text-white/50 hover:text-blue-400 hover:bg-blue-400/10"
          title="Perfil do Operador"
        >
          <User size={24} />
        </button>
      </nav>

      <div className="p-4 flex flex-col items-center space-y-4 border-t border-[var(--theme-color)]/20">
        <button 
          onClick={onOpenTutorial}
          className="text-white/40 hover:text-yellow-400 transition-colors"
          title="Ajuda / Tutorial"
        >
          <HelpCircle size={22} />
        </button>
        <button 
          onClick={onOpenSettings}
          className="text-white/40 hover:text-white transition-colors"
          title="Configurações do Sistema"
        >
          <Settings size={22} />
        </button>
        <button 
          onClick={onLogout}
          className="text-[#ff0055]/50 hover:text-[#ff0055] hover:bg-[#ff0055]/10 p-2 rounded-lg transition-all"
          title="Desconectar"
        >
          <LogOut size={22} />
        </button>
      </div>
    </aside>
  );
}
