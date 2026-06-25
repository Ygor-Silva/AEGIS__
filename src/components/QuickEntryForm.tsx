import React, { useState, useEffect, useRef } from "react";
import { Plus, Mic, MicOff, Sparkles } from "lucide-react";
import { emitToast } from "./Toast";

// Helper to parse spoken financial transactions in Portuguese
function parsePortugueseVoiceCommand(text: string): { description: string; amount: string } {
  let cleaned = text.toLowerCase().trim();
  
  // Standardize commas to dots for decimals (e.g. "25,50" -> "25.50")
  cleaned = cleaned.replace(/(\d+),(\d+)/g, "$1.$2");

  // Match pattern of numbers (e.g., "55.50", "120", "8")
  const numberRegex = /(\d+[\.]\d+|\d+)/;
  const match = cleaned.match(numberRegex);
  
  let amount = "";
  let description = text; // fallback

  if (match) {
    amount = match[1];
    
    // Remove amount from text to extract description
    let withoutNumber = cleaned.replace(amount, "").trim();
    
    // Clean up noise words common in Portuguese spoken transactions
    const noisePatterns = [
      /\breais\b/gi, /\breal\b/gi, /\bcentavos\b/gi,
      /\bgastei\b/gi, /\bcomprei\b/gi, /\bno\b/gi, /\bna\b/gi,
      /\bcom\b/gi, /\bde\b/gi, /\bem\b/gi, /\bpor\b/gi,
      /\bpara\b/gi, /\bmeu\b/gi, /\bminha\b/gi, /\bum\b/gi, /\buma\b/gi,
      /\bda\b/gi, /\bdo\b/gi
    ];
    
    let tempDesc = withoutNumber;
    noisePatterns.forEach(pattern => {
      tempDesc = tempDesc.replace(pattern, "");
    });
    
    // Clean spaces
    tempDesc = tempDesc.replace(/\s+/g, " ").trim();
    
    if (tempDesc.length > 0) {
      description = tempDesc.toUpperCase();
    } else {
      description = "LANÇAMENTO_VOZ";
    }
  } else {
    // If no digits are matched, support common word-based numbers
    const textNumbers: { [key: string]: string } = {
      "um": "1", "uma": "1", "dois": "2", "duas": "2", "três": "3", "quatro": "4", "cinco": "5",
      "seis": "6", "sete": "7", "oito": "8", "nove": "9", "dez": "10",
      "vinte": "20", "trinta": "30", "quarenta": "40", "cinquenta": "50", "cem": "100"
    };

    let foundWord = "";
    let foundVal = "";
    for (const [word, val] of Object.entries(textNumbers)) {
      const reg = new RegExp(`\\b${word}\\b`, "i");
      if (reg.test(cleaned)) {
        foundWord = word;
        foundVal = val;
        break;
      }
    }

    if (foundWord) {
      amount = foundVal;
      let withoutWord = cleaned.replace(new RegExp(`\\b${foundWord}\\b`, "gi"), "").trim();
      const noisePatterns = [
        /\breais\b/gi, /\breal\b/gi, /\bcentavos\b/gi,
        /\bgastei\b/gi, /\bcomprei\b/gi, /\bno\b/gi, /\bna\b/gi,
        /\bcom\b/gi, /\bde\b/gi, /\bem\b/gi, /\bpor\b/gi,
        /\bum\b/gi, /\buma\b/gi
      ];
      let tempDesc = withoutWord;
      noisePatterns.forEach(pattern => {
        tempDesc = tempDesc.replace(pattern, "");
      });
      tempDesc = tempDesc.replace(/\s+/g, " ").trim();
      description = tempDesc ? tempDesc.toUpperCase() : "LANÇAMENTO_VOZ";
    }
  }

  return { description, amount };
}

export default function QuickEntryForm() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const descLower = description.trim().toLowerCase();
    
    // 1. Instant local dictionary check for instant feedback
    if (descLower.length > 1) {
      if (/uber|99taxi|taxi|combustivel|posto|gasolina|metro|onibus|passagem/.test(descLower)) {
        setCategory("Transporte");
        return;
      }
      if (/ifood|mercado|restaurante|mcdonald|almoço|jantar|pizza|padaria|carrefour|comida|supermercado/.test(descLower)) {
        setCategory("Alimentação");
        return;
      }
      if (/aluguel|condominio|luz|agua|energia|internet|net|eletricidade|gás/.test(descLower)) {
        setCategory("Habitação");
        return;
      }
      if (/netflix|spotify|steam|cinema|game|jogos|lazer|ps5|xbox|teatro|shopping/.test(descLower)) {
        setCategory("Lazer");
        return;
      }
      if (/salario|dividendos|freelance|pix|receita|rendimento|poupanca/.test(descLower)) {
        setCategory("Receitas");
        return;
      }
      if (/farmacia|medico|hospital|saude|dentista|remedio|clinica/.test(descLower)) {
        setCategory("Saúde");
        return;
      }
      if (/escola|faculdade|curso|livros|udemy|educacao|facul/.test(descLower)) {
        setCategory("Educação");
        return;
      }
    }

    // 2. Debounced API fallback if no local keyword matched
    const delayDebounceFn = setTimeout(async () => {
      if (description.trim().length > 2) {
        setIsAnalyzing(true);
        try {
          const res = await fetch("/api/categorize", {
            method: "POST",
            headers: { 
              "Content-Type": "application/json",
              "x-openrouter-key": localStorage.getItem("openrouter_api_key") || "",
              "x-openrouter-model": localStorage.getItem("openrouter_model") || "openrouter/auto"
            },
            body: JSON.stringify({ description }),
          });
          
          let data: any = {};
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const errorText = await res.text();
            throw new Error(errorText || `HTTP error! status: ${res.status}`);
          }

          if (res.ok && data.category) {
            setCategory(data.category);
          }
        } catch (err) {
          console.error("Erro na busca remota de categoria:", err);
        } finally {
          setIsAnalyzing(false);
        }
      } else {
        setCategory("");
      }
    }, 800);

    return () => clearTimeout(delayDebounceFn);
  }, [description]);

  // Clean up recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVoiceCapture = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      emitToast("Reconhecimento de voz não suportado neste navegador.", "error");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'pt-BR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setIsListening(true);
      emitToast("🎙️ Escutando... Diga o lançamento (ex: 'Gastei 45 reais no iFood')", "info");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript) {
        const { description: parsedDesc, amount: parsedAmount } = parsePortugueseVoiceCommand(transcript);
        
        if (parsedDesc) {
          setDescription(parsedDesc);
        }
        if (parsedAmount) {
          setAmount(parsedAmount);
          emitToast(`Voz capturada: "${parsedDesc}" - R$ ${parsedAmount}`, "success");
        } else {
          emitToast(`Voz capturada: "${parsedDesc}". Adicione o valor.`, "warning");
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error("SpeechRecognition error:", event.error);
      if (event.error === 'not-allowed') {
        emitToast("Permissão de uso do microfone negada.", "error");
      } else {
        emitToast("Erro de reconhecimento ou sem sinal de áudio.", "error");
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category) return;
    
    // In a real app we would save to a database here.
    emitToast("Dados de gastos atualizados", "success");
    // For now, we just clear the form.
    setDescription("");
    setAmount("");
    setCategory("");
  };

  return (
    <div className="bg-[#0a1a2f]/40 border border-[#00ffc2]/10 p-4 relative overflow-hidden">
      {/* Decorative pulse for listening state */}
      {isListening && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse border border-red-500/20 pointer-events-none" />
      )}
      
      <div className="text-[10px] uppercase opacity-50 mb-4 flex justify-between items-center font-mono">
        <span className="flex items-center gap-1.5">
          Lançamento Rápido
          {isListening && <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />}
        </span>
        {isListening ? (
          <span className="text-red-400 animate-pulse flex items-center gap-1">
            <Mic size={10} className="animate-bounce" /> ESCUTANDO...
          </span>
        ) : isAnalyzing ? (
          <span className="text-[#00ffc2] animate-pulse">ANALISANDO PADRÃO...</span>
        ) : null}
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={isListening ? "FALE AGORA..." : "DESCRIÇÃO (EX: UBER)"}
              className={`w-full bg-black/50 border p-2 pr-10 text-xs outline-none transition-all duration-300 font-mono ${
                isListening 
                  ? "border-red-500/40 text-red-400 placeholder-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.1)]" 
                  : "border-[#00ffc2]/20 text-[#00ffc2] placeholder-[#00ffc2]/30 focus:border-[#00ffc2]/60"
              }`}
              disabled={isListening}
            />
            <button
              type="button"
              onClick={startVoiceCapture}
              className={`absolute right-1 p-1 cursor-pointer transition-all duration-300 ${
                isListening 
                  ? "text-red-500 bg-red-500/10 border border-red-500/40 animate-pulse rounded-sm" 
                  : "text-[#00ffc2] hover:text-[#00ffc2]/80 hover:bg-[#00ffc2]/10"
              }`}
              title="Inserir por comando de voz"
            >
              {isListening ? <MicOff size={13} className="animate-bounce" /> : <Mic size={13} />}
            </button>
          </div>
        </div>
        
        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="VALOR"
            step="0.01"
            className="flex-1 bg-black/50 border border-[#00ffc2]/20 p-2 text-xs text-[#00ffc2] placeholder-[#00ffc2]/30 outline-none focus:border-[#00ffc2]/60 transition-colors"
          />
          <div className="flex-1 relative">
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="CATEGORIA"
              className="w-full bg-black/50 border border-[#00ffc2]/20 p-2 text-xs text-[#00d4ff] placeholder-[#00d4ff]/30 outline-none focus:border-[#00ffc2]/60 transition-colors"
            />
            {category && !isAnalyzing && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00ffc2] shadow-[0_0_8px_#00ffc2] animate-pulse rounded-full" title="Categoria Sugerida"></div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2 bg-[#00ffc2]/10 border border-[#00ffc2]/30 text-[#00ffc2] hover:bg-[#00ffc2] hover:text-black transition-colors flex items-center justify-center gap-2 text-[10px] font-bold tracking-widest uppercase"
        >
          <Plus size={14} />
          Registrar Lançamento
        </button>
      </form>
    </div>
  );
}
