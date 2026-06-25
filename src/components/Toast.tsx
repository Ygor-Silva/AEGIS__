import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal } from 'lucide-react';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'info' | 'error';
}

export const emitToast = (message: string, type: ToastMessage['type'] = 'info') => {
  const event = new CustomEvent('aegis-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handleToast = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newToast: ToastMessage = {
        id: Date.now().toString() + Math.random().toString(),
        message: customEvent.detail.message,
        type: customEvent.detail.type,
      };
      
      setToasts((prev) => [...prev, newToast]);
      
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, 4000);
    };

    window.addEventListener('aegis-toast', handleToast);
    return () => window.removeEventListener('aegis-toast', handleToast);
  }, []);

  return (
    <div className="fixed top-24 right-4 z-[200] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`border bg-black/90 p-3 flex items-start gap-3 backdrop-blur-md shadow-lg pointer-events-auto min-w-[250px] max-w-sm ${
              toast.type === 'success' ? 'border-[var(--theme-color)] text-[var(--theme-color)] shadow-[0_0_10px_rgba(0,255,194,0.2)]' :
              toast.type === 'error' ? 'border-red-500 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
              toast.type === 'warning' ? 'border-orange-500 text-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.2)]' :
              'border-[#00d4ff] text-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.2)]'
            }`}
          >
            <Terminal size={16} className="mt-0.5 opacity-80" />
            <div className="flex-1">
              <div className="text-base uppercase tracking-widest opacity-60 mb-1">
                {toast.type === 'success' ? 'SYS.SUCCESS' : toast.type === 'error' ? 'SYS.ERROR' : toast.type === 'warning' ? 'SYS.WARN' : 'SYS.INFO'}
              </div>
              <div className="text-base font-mono font-bold leading-tight">
                &gt; {toast.message}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
