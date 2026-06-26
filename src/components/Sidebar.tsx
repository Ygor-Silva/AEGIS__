import React from 'react';
import { MessageSquare, LayoutDashboard, Target, Activity, LogOut, Settings, HelpCircle, User, BarChart2 } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenTutorial: () => void;
  onOpenProfile: () => void;
  activeTab: 'chat' | 'dashboard' | 'reports';
  setActiveTab: (tab: 'chat' | 'dashboard' | 'reports') => void;
  logoUrl: string;
  userData: any;
}

export default function Sidebar({ onLogout, onOpenSettings, onOpenTutorial, onOpenProfile, activeTab, setActiveTab, logoUrl, userData }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-20 h-full border-r border-[var(--theme-color)]/30 bg-[#000]/80 backdrop-blur-md relative z-20 shrink-0">
      <div className="p-4 flex justify-center items-center border-b border-[var(--theme-color)]/20">
        <img src={logoUrl} alt="Logo" className="w-12 h-12 border-2 border-[var(--theme-color)] rounded-full object-cover shadow-[0_0_15px_var(--theme-color)40]" />
      </div>

      <nav className="flex-1 flex flex-col items-center py-6 space-y-8">
        <button 
          id="tour-sidebar-chat"
          onClick={() => setActiveTab('chat')}
          className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'chat' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10'}`}
          title="Terminal (Chat)"
        >
          <MessageSquare size={24} />
          {activeTab === 'chat' && <span className="absolute -left-1 top-2 bottom-2 w-1 bg-[var(--theme-color)] rounded-r-md shadow-[0_0_10px_var(--theme-color)]" />}
        </button>

        <button 
          id="tour-sidebar-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'dashboard' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10'}`}
          title="Dashboard Financeiro"
        >
          <LayoutDashboard size={24} />
          {activeTab === 'dashboard' && <span className="absolute -left-1 top-2 bottom-2 w-1 bg-[var(--theme-color)] rounded-r-md shadow-[0_0_10px_var(--theme-color)]" />}
        </button>

        <button 
          id="tour-sidebar-reports"
          onClick={() => setActiveTab('reports')}
          className={`relative p-3 rounded-xl transition-all duration-300 group ${activeTab === 'reports' ? 'bg-[var(--theme-color)]/20 text-[var(--theme-color)]' : 'text-white/50 hover:text-[var(--theme-color)] hover:bg-[var(--theme-color)]/10'}`}
          title="Relatórios Consolidados"
        >
          <BarChart2 size={24} />
          {activeTab === 'reports' && <span className="absolute -left-1 top-2 bottom-2 w-1 bg-[var(--theme-color)] rounded-r-md shadow-[0_0_10px_var(--theme-color)]" />}
        </button>

        <button 
          id="tour-profile-button"
          onClick={onOpenProfile}
          className="relative p-1.5 rounded-xl transition-all duration-300 group text-white/50 hover:text-blue-400 hover:bg-blue-400/10 flex flex-col items-center justify-center gap-1"
          title="Perfil do Operador"
        >
          {userData?.photo ? (
            <img src={userData.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-white/20" />
          ) : (
            <User size={24} className="m-1.5" />
          )}
        </button>
      </nav>

      <div className="p-4 flex flex-col items-center space-y-4 border-t border-[var(--theme-color)]/20">
        <button 
          id="tour-tutorial-button"
          onClick={onOpenTutorial}
          className="text-white/40 hover:text-yellow-400 transition-colors"
          title="Ajuda / Tutorial"
        >
          <HelpCircle size={22} />
        </button>
        <button 
          id="tour-settings-button"
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
