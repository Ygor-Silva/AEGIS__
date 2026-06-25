import React, { useState } from 'react';
import { User, LogOut, Settings, Download, X, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { emitToast } from './Toast';

interface QuickActionsProps {
  onLogout: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
}

export default function QuickActions({ onLogout, onOpenProfile, onOpenSettings }: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = () => {
    emitToast("Gerando relatório criptografado...", "info");
    setTimeout(() => {
      emitToast("Relatório exportado com sucesso (SYS.DIR/reports)", "success");
      setIsOpen(false);
    }, 1500);
  };

  const handleProfile = () => {
    onOpenProfile();
    setIsOpen(false);
  };

  const actions = [
    { icon: <User size={16} />, label: "PERFIL", onClick: handleProfile, color: "text-[#00d4ff]", border: "border-[#00d4ff]/50", bgHover: "hover:bg-[#00d4ff]" },
    { icon: <Settings size={16} />, label: "CONFIGURAÇÕES", onClick: () => { onOpenSettings(); setIsOpen(false); }, color: "text-[#00ffc2]", border: "border-[#00ffc2]/50", bgHover: "hover:bg-[#00ffc2]" },
    { icon: <Download size={16} />, label: "EXPORTAR RELATÓRIO", onClick: handleExport, color: "text-[#b000ff]", border: "border-[#b000ff]/50", bgHover: "hover:bg-[#b000ff]" },
    { icon: <LogOut size={16} />, label: "DESCONECTAR", onClick: onLogout, color: "text-[#ff0055]", border: "border-[#ff0055]/50", bgHover: "hover:bg-[#ff0055]" },
  ];

  return (
    <div className="fixed bottom-10 right-6 z-[100] flex flex-col items-end gap-3">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="flex flex-col gap-2 items-end mb-2"
          >
            {actions.map((action, idx) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.05 } }}
                exit={{ opacity: 0, x: 20, transition: { delay: (actions.length - 1 - idx) * 0.05 } }}
                onClick={action.onClick}
                className={`flex items-center gap-3 bg-black/80 backdrop-blur-sm border ${action.border} ${action.color} px-4 py-2 hover:text-black ${action.bgHover} transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] group cursor-pointer`}
              >
                <span className="text-[10px] font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100">{action.label}</span>
                {action.icon}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#0a1a2f] border-2 border-[#00ffc2] text-[#00ffc2] flex items-center justify-center rounded-none shadow-[0_0_20px_rgba(0,255,194,0.3)] hover:bg-[#00ffc2] hover:text-black hover:shadow-[0_0_30px_rgba(0,255,194,0.6)] transition-all z-10 cursor-pointer"
      >
        <motion.div
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isOpen ? <X size={24} /> : <Shield size={24} />}
        </motion.div>
      </button>
    </div>
  );
}
