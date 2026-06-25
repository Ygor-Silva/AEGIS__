import React, { useEffect, useState } from 'react';
import { Globe, TrendingUp, AlertCircle, RefreshCw, Maximize2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NewsItem {
  title: string;
  source: string;
  summary: string;
}

export default function MarketNews() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch('/api/finance-news');
      const data = await res.json();
      if (data.headlines && Array.isArray(data.headlines)) {
        setNews(data.headlines);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const content = (
    <div className={`flex-1 overflow-y-auto scrollbar-none space-y-3 ${expanded ? 'pr-2' : ''}`}>
      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-black/30 p-3 rounded-lg border border-white/5">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-[#ff0055] text-xs flex items-center gap-2 p-3 bg-[#ff0055]/5 rounded-lg border border-[#ff0055]/20">
          <AlertCircle size={14} />
          Não foi possível carregar as notícias de mercado no momento.
        </div>
      ) : news.length === 0 ? (
         <div className="text-white/50 text-xs p-3">
           Nenhuma manchete disponível.
         </div>
      ) : (
        news.map((item, index) => (
          <div key={index} className="bg-black/40 p-3 rounded-lg border border-[var(--theme-color)]/10 hover:border-[var(--theme-color)]/30 transition-colors group">
            <h4 className="text-sm font-bold text-white mb-1 group-hover:text-[var(--theme-color)] transition-colors line-clamp-2">
              {item.title}
            </h4>
            <p className="text-xs text-white/60 mb-2 line-clamp-3 leading-relaxed">
              {item.summary}
            </p>
            <div className="flex items-center text-[10px] text-[var(--theme-color)]/70 font-mono uppercase tracking-wider">
              <TrendingUp size={10} className="mr-1" />
              FONTE: {item.source || 'MERCADO FINANCEIRO'}
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <>
      <div className="bg-[var(--theme-color)]/5 border border-[var(--theme-color)]/20 rounded-xl p-4 flex flex-col h-full overflow-hidden relative">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-[var(--theme-color)] uppercase tracking-wider flex items-center gap-2">
            <Globe size={16} /> Radar de Mercado
          </h3>
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchNews} 
              disabled={loading}
              className="text-[var(--theme-color)]/50 hover:text-[var(--theme-color)] transition-colors disabled:opacity-50"
              title="Atualizar"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => setExpanded(true)} 
              className="text-[var(--theme-color)]/50 hover:text-[var(--theme-color)] transition-colors"
              title="Expandir"
            >
              <Maximize2 size={14} />
            </button>
          </div>
        </div>
        
        {content}

        {!expanded && !loading && !error && news.length > 0 && (
          <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-[#040e1b] to-transparent pointer-events-none rounded-b-xl flex items-end justify-center pb-2">
             <button 
                onClick={() => setExpanded(true)} 
                className="text-[10px] font-mono text-[var(--theme-color)]/70 hover:text-[var(--theme-color)] uppercase tracking-widest pointer-events-auto bg-[#040e1b] px-3 py-1 rounded-full border border-[var(--theme-color)]/20 shadow-[0_0_10px_rgba(0,255,194,0.1)] transition-all"
             >
                Ler mais
             </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#020812]/80 backdrop-blur-sm"
              onClick={() => setExpanded(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] bg-[#0a1a2f] border border-[var(--theme-color)]/40 rounded-xl shadow-[0_0_50px_rgba(0,255,194,0.1)] flex flex-col overflow-hidden"
            >
              <div className="bg-[var(--theme-color)]/10 px-6 py-4 border-b border-[var(--theme-color)]/20 flex justify-between items-center relative z-10 shrink-0">
                <div className="flex items-center gap-3">
                  <Globe size={20} className="text-[var(--theme-color)]" />
                  <span className="text-lg font-bold text-[var(--theme-color)] tracking-widest uppercase">Radar de Mercado (Expandido)</span>
                </div>
                <button 
                  onClick={() => setExpanded(false)} 
                  className="text-[var(--theme-color)]/50 hover:text-[var(--theme-color)] transition-colors p-2 bg-black/20 rounded-lg hover:bg-black/40"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 scrollbar-none">
                {content}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
