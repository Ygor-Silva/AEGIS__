import React, { useState, useRef, useEffect } from "react";
import { Message } from "../types";
import { Send, Image as ImageIcon, Mic, Radio, Volume2, Square, X, Camera } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ReactMarkdown from "react-markdown";
import CameraOverlay from "./CameraOverlay";

interface ParsedMessage {
  message: string;
  action: string;
  tags: string[];
}

function parseModelResponse(text: string): ParsedMessage {
  let message = "";
  let action = "";
  let tags: string[] = [];

  const messageMatch = text.match(/\[MENSAGEM\]([\s\S]*?)(?=\[AÇÃO PRÁTICA\]|\[TAGS\]|$)/i);
  const actionMatch = text.match(/\[AÇÃO PRÁTICA\]([\s\S]*?)(?=\[TAGS\]|\[MENSAGEM\]|$)/i);
  const tagsMatch = text.match(/\[TAGS\]([\s\S]*?)$/i);

  if (messageMatch) {
    message = messageMatch[1].trim();
  } else {
    if (!text.includes("[AÇÃO PRÁTICA]") && !text.includes("[TAGS]")) {
      message = text;
    } else {
      message = text.split(/\[AÇÃO PRÁTICA\]|\[TAGS\]/i)[0].trim();
    }
  }

  if (actionMatch) {
    action = actionMatch[1].trim();
  }

  if (tagsMatch) {
    const rawTags = tagsMatch[1].trim();
    tags = rawTags
      .split(/[\n,;]+/)
      .map(t => t.trim().replace(/^[-*•]\s*/, ""))
      .filter(t => t.length > 0 && !t.startsWith("(") && !t.endsWith(")"));
  }

  return { message, action, tags };
}

export default function ChatInterface({ externalCommand, onExternalCommandProcessed }: { externalCommand?: string | null; onExternalCommandProcessed?: () => void } = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [liveConnected, setLiveConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  
  // Live API refs
  const liveWsRef = useRef<WebSocket | null>(null);
  const liveInputCtxRef = useRef<AudioContext | null>(null);
  const liveOutputCtxRef = useRef<AudioContext | null>(null);
  const liveProcessorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const pcmToBase64 = (buffer: Float32Array) => {
    const l = buffer.length;
    const buf = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      buf[i] = Math.min(1, buffer[i]) * 0x7fff;
    }
    const bytes = new Uint8Array(buf.buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const playAudioChunk = async (audioCtx: AudioContext, base64Audio: string) => {
    try {
      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const audioBuffer = await audioCtx.decodeAudioData(bytes.buffer);
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
    } catch (err) {
      console.error("Audio playback error:", err);
    }
  };

  const sendSpecificMessage = async (text: string, imageContent: string | null) => {
    if (!text.trim() && !imageContent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      text: text,
      image: imageContent || undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Coleta o estado calibrado do ecossistema para passar ao assistente
      const savedOnboarding = localStorage.getItem("aegis_onboarding_data");
      const onboarding = savedOnboarding ? JSON.parse(savedOnboarding) : null;
      const income = onboarding ? parseFloat(onboarding.income) || 5000 : 5000;
      
      const totalAssets = income * 8.578024;
      const totalIncome = income + (income * 0.038); // salário + dividendos
      const totalExpenses = (income * 0.2976) + (income * 0.10125) + (income * 0.0369); // aluguel + mercado + energia
      const currentBalance = totalIncome - totalExpenses;
      const projectedExpenses = currentBalance * 0.247;
      const projectedBalance = currentBalance - projectedExpenses;

      const financialContext = `
[DADOS ATUAIS DO ECOSSISTEMA FINANCEIRO DE A.E.G.I.S.]:
- Renda Mensal Calibrada (Salário Base): R$ ${income.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Patrimônio Total Líquido: R$ ${totalAssets.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Saldo Atual Estimado: R$ ${currentBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Saídas Previstas Pendentes: R$ ${projectedExpenses.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
- Saldo Projetado Fim de Mês: R$ ${projectedBalance.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

[LANÇAMENTOS DO EXTRATO RECENTE (PROPORCIONAIS)]:
1. 01/06 - SALÁRIO: + R$ ${income.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
2. 05/06 - ALUGUEL: - R$ ${(income * 0.2976).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
3. 12/06 - SUPERMERCADO: - R$ ${(income * 0.10125).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
4. 18/06 - DIVIDENDOS: + R$ ${(income * 0.038).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
5. 20/06 - ENERGIA/NET: - R$ ${(income * 0.0369).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

[METAS ATIVAS E EVOLUÇÃO]:
- RESERVA DE EMERGÊNCIA: R$ ${Math.round(income * 4).toLocaleString("pt-BR")} / R$ ${Math.round(income * 5).toLocaleString("pt-BR")} (80% Concluído)
- INVESTIMENTOS LP: R$ ${Math.round(income * 2.4).toLocaleString("pt-BR")} / R$ ${Math.round(income * 3).toLocaleString("pt-BR")} (80% Concluído)
- FUNDO DE UPGRADES: R$ ${Math.round(income * 0.7).toLocaleString("pt-BR")} / R$ ${Math.round(income * 1).toLocaleString("pt-BR")} (70% Concluído)
`;

      const contents = messages.concat(userMessage).map((msg) => {
        const parts: any[] = [];
        if (msg.image) {
          const match = msg.image.match(/^data:(image\/[a-z]+);base64,(.+)$/);
          if (match) {
            parts.push({
              inlineData: {
                mimeType: match[1],
                data: match[2],
              },
            });
          }
        }
        if (msg.text) {
          // Instruct Gemini to answer in Portuguese
          const isCommand = msg === userMessage;
          const textToSend = isCommand ? `${msg.text}\n\n(Lembrete de sistema: Responda obrigatoriamente em Português-BR (PT-BR), mesmo que eu tenha falado em outro idioma)` : msg.text;
          parts.push({ text: textToSend });
        }
        return {
          role: msg.role,
          parts,
        };
      });

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-openrouter-key": localStorage.getItem("openrouter_api_key") || "",
          "x-openrouter-model": localStorage.getItem("openrouter_model") || "openrouter/auto"
        },
        body: JSON.stringify({ contents, financialContext }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: data.text,
          },
        ]);
      } else {
        console.error(data.error);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "model",
            text: `Meus servidores estão analisando muitos orçamentos agora. Tente me perguntar novamente em alguns minutos!`,
          },
        ]);
      }
    } catch (err: any) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "model",
          text: `Meus servidores estão analisando muitos orçamentos agora. Tente me perguntar novamente em alguns minutos!`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    const textToSend = input;
    const imageToSend = previewImage;
    setInput("");
    setPreviewImage(null);
    await sendSpecificMessage(textToSend, imageToSend);
  };

  useEffect(() => {
    if (externalCommand) {
      sendSpecificMessage(externalCommand, null);
      if (onExternalCommandProcessed) {
        onExternalCommandProcessed();
      }
    }
  }, [externalCommand]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setIsLoading(true);
        const formData = new FormData();
        formData.append("audio", audioBlob);

        try {
          const res = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          });
          
          let data: any = {};
          const contentType = res.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            data = await res.json();
          } else {
            const errorText = await res.text();
            throw new Error(errorText || `HTTP error! status: ${res.status}`);
          }

          if (res.ok) {
            setInput((prev) => prev + (prev ? " " : "") + data.text);
          } else {
             setMessages((prev) => [
              ...prev,
              {
                id: Date.now().toString(),
                role: "model",
                text: `⚠️ **[ERRO DE TRANSCRIÇÃO]**: ${data.error || "Erro desconhecido"}`,
              },
            ]);
          }
        } catch (err) {
          console.error("Transcription error", err);
          setMessages((prev) => [
            ...prev,
            {
              id: Date.now().toString(),
              role: "model",
              text: `⚠️ **[FALHA DE COMUNICAÇÃO DE ÁUDIO]**: Não foi possível processar o áudio.`,
            },
          ]);
        } finally {
          setIsLoading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
    }
  };

  const handleReadAloud = async (messageId: string, text: string) => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, isReading: true } : m))
    );
    try {
      const parsedText = parseModelResponse(text).message || text;
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: parsedText }),
      });
      
      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const errorText = await res.text();
        throw new Error(errorText || `HTTP error! status: ${res.status}`);
      }

      if (res.ok && data.audio) {
        const audioCtx = new window.AudioContext({ sampleRate: 24000 });
        await playAudioChunk(audioCtx, data.audio);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "model",
            text: `⚠️ **[ERRO DE ÁUDIO]**: Falha na síntese de voz. ${data.error || ""}`,
          },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "model",
          text: `⚠️ **[ERRO DE ÁUDIO]**: Falha ao comunicar com o sintetizador de voz.`,
        },
      ]);
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, isReading: false } : m))
      );
    }
  };

  const startLiveMode = async () => {
    setIsLiveMode(true);
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const ws = new WebSocket(`${protocol}//${window.location.host}/live`);
      liveWsRef.current = ws;

      const inputAudioCtx = new AudioContext({ sampleRate: 16000 });
      const outputAudioCtx = new AudioContext({ sampleRate: 24000 });
      liveInputCtxRef.current = inputAudioCtx;
      liveOutputCtxRef.current = outputAudioCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = inputAudioCtx.createMediaStreamSource(stream);
      const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
      liveProcessorRef.current = processor;

      source.connect(processor);
      processor.connect(inputAudioCtx.destination);

      ws.onopen = () => setLiveConnected(true);

      processor.onaudioprocess = (e) => {
        if (ws.readyState === WebSocket.OPEN) {
          const base64 = pcmToBase64(e.inputBuffer.getChannelData(0));
          ws.send(JSON.stringify({ audio: base64 }));
        }
      };

      ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.audio && liveOutputCtxRef.current) {
          playAudioChunk(liveOutputCtxRef.current, msg.audio);
        }
      };
    } catch (err) {
      console.error("Live mode error", err);
      stopLiveMode();
    }
  };

  const stopLiveMode = () => {
    if (liveWsRef.current) {
      liveWsRef.current.close();
      liveWsRef.current = null;
    }
    if (liveInputCtxRef.current) {
      liveInputCtxRef.current.close();
      liveInputCtxRef.current = null;
    }
    if (liveOutputCtxRef.current) {
      liveOutputCtxRef.current.close();
      liveOutputCtxRef.current = null;
    }
    setLiveConnected(false);
    setIsLiveMode(false);
  };

  return (
    <div className="flex flex-col h-full bg-transparent text-[#00ffc2] p-4 relative z-20">
      {/* HUD Header overlay inside chat area */}
      <div className="flex justify-between items-center pb-2 mb-4">
        <div className="flex items-center space-x-2"></div>
        <button
          onClick={isLiveMode ? stopLiveMode : startLiveMode}
          className={`flex items-center space-x-2 px-3 py-1 border ${isLiveMode ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-[#00ffc2]/50 hover:bg-[#00ffc2]/10'}`}
        >
          <Radio size={16} className={isLiveMode && liveConnected ? 'animate-pulse' : ''} />
          <span className="text-[10px] font-bold uppercase">{isLiveMode ? "LINK ATIVO" : "VOICE LINK"}</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-[#00ffc2]/20 pr-2">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] p-3 text-sm ${
                  msg.role === "user"
                    ? "bg-[#00d4ff]/10 border border-[#00d4ff]/30 text-[#00d4ff]"
                    : "bg-[#00ffc2]/5 border-l-2 border-[#00ffc2] text-white"
                }`}
              >
                {msg.role === "model" && (
                  <div className="flex justify-between items-start mb-2 border-b border-[#00ffc2]/20 pb-1">
                    <span className="text-[9px] font-bold tracking-widest text-[#00ffc2]">AEGIS_RESPONSE</span>
                    <button
                      onClick={() => handleReadAloud(msg.id, msg.text)}
                      className={`text-[#00ffc2]/70 hover:text-[#00ffc2] ${msg.isReading ? 'animate-pulse' : ''}`}
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                )}
                {msg.image && (
                  <img src={msg.image} alt="Upload" className="max-w-full h-auto max-h-48 mb-2 border border-[#00d4ff]/30" />
                )}
                {msg.role === "model" ? (
                  (() => {
                    const parsed = parseModelResponse(msg.text);
                    return (
                      <div className="space-y-3">
                        <div className="prose prose-invert prose-p:my-1 prose-headings:text-[#00ffc2] prose-strong:text-white prose-ul:my-1 prose-li:my-0 text-sm text-white/90">
                          <ReactMarkdown>{parsed.message}</ReactMarkdown>
                        </div>
                        
                        {parsed.action && (
                          <div className="p-3 bg-[#00ffc2]/5 border border-[#00ffc2]/20 relative overflow-hidden mt-3 rounded-none">
                            <div className="absolute top-0 right-0 bg-[#00ffc2]/20 border-l border-b border-[#00ffc2]/30 text-[#00ffc2] text-[7px] font-mono px-1.5 py-0.5 font-bold uppercase tracking-wider">
                              Ação Prática
                            </div>
                            <div className="prose prose-invert text-xs font-mono text-white/80 leading-relaxed pt-1">
                              <ReactMarkdown>{parsed.action}</ReactMarkdown>
                            </div>
                          </div>
                        )}

                        {parsed.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
                            {parsed.tags.map((tag, idx) => (
                              <span 
                                key={idx} 
                                className="px-2 py-0.5 bg-black/50 border border-[#00d4ff]/25 text-[#00d4ff] text-[8px] font-mono font-bold uppercase tracking-wider"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : (
                  <div className="prose prose-invert prose-p:my-1 prose-headings:text-[#00d4ff] prose-strong:text-white prose-ul:my-1 prose-li:my-0 text-sm">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="p-3 bg-[#00ffc2]/5 border-l-2 border-[#00ffc2] text-[#00ffc2] text-sm flex items-center space-x-2">
                <span className="animate-pulse font-bold tracking-widest text-[10px] font-mono">
                  Estou processando seus dados financeiros, um momento...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {previewImage && (
        <div className="relative inline-block mb-2 self-start border border-[#00d4ff]/50 p-1 bg-black/80">
          <img src={previewImage} alt="Preview" className="h-20 object-contain" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute -top-2 -right-2 bg-black border border-red-500 text-red-500 rounded-full p-0.5 hover:bg-red-500/20"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* Input Form */}
      <div className="flex items-center space-x-2 border border-[#00ffc2]/30 bg-black/60 p-2 relative">
        <input
          type="file"
          accept="image/*"
          id="image-upload"
          className="hidden"
          onChange={handleImageUpload}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer p-2 text-[#00ffc2]/70 hover:text-[#00ffc2] hover:bg-[#00ffc2]/10 transition-colors"
        >
          <ImageIcon size={18} />
        </label>

        <button
          onClick={() => setIsCameraOpen(true)}
          className="p-2 text-[#00ffc2]/70 hover:text-[#00ffc2] hover:bg-[#00ffc2]/10 transition-colors"
        >
          <Camera size={18} />
        </button>

        <button
          onMouseDown={startRecording}
          onMouseUp={stopRecording}
          onMouseLeave={stopRecording}
          onTouchStart={startRecording}
          onTouchEnd={stopRecording}
          className={`p-2 transition-colors ${isRecording ? "text-red-500 bg-red-950/40 animate-pulse" : "text-[#00ffc2]/70 hover:text-[#00ffc2] hover:bg-[#00ffc2]/10"}`}
        >
          {isRecording ? <Square size={18} /> : <Mic size={18} />}
        </button>

        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isRecording ? "" : "INSERIR COMANDO..."}
            className={`w-full bg-transparent border-none outline-none text-[#00ffc2] placeholder-[#00ffc2]/30 text-sm tracking-wide ${isRecording ? 'opacity-0' : 'opacity-100'}`}
          />
          {isRecording && (
            <div className="absolute inset-0 flex items-center space-x-1 pointer-events-none pl-2">
              <span className="mr-2 text-[10px] font-bold text-[#00ffc2] animate-pulse tracking-widest uppercase">Gravando Audio</span>
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1 bg-[#00ffc2] shadow-[0_0_8px_#00ffc2]"
                  animate={{ height: ["4px", "24px", "4px"] }}
                  transition={{
                    duration: 0.5 + Math.random() * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: Math.random() * 0.5
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSend}
          disabled={isLoading || (!input.trim() && !previewImage)}
          className="px-4 py-2 bg-[#00ffc2] text-black font-bold text-[10px] uppercase hover:bg-white transition-colors disabled:opacity-50"
        >
          Processar
        </button>
      </div>

      {isCameraOpen && (
        <CameraOverlay 
          onCapture={(dataUrl) => {
            setPreviewImage(dataUrl);
            setIsCameraOpen(false);
          }} 
          onClose={() => setIsCameraOpen(false)} 
        />
      )}

      {isLiveMode && (
        <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center border-4 border-red-900/50">
          <div className="text-center space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 border-2 border-red-500 rounded-full animate-ping opacity-20 absolute"></div>
              <div className="w-24 h-24 border-4 border-red-500 rounded-full animate-pulse flex items-center justify-center bg-red-500/10">
                 <Radio size={40} className="text-red-500" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-[0.3em] text-red-500">VOICE LINK</h2>
              <p className="text-red-400/80 uppercase text-sm tracking-widest animate-pulse">
                {liveConnected ? "CONEXÃO ESTABELECIDA // FALE AGORA" : "CONECTANDO AO NÚCLEO..."}
              </p>
            </div>
            <button
              onClick={stopLiveMode}
              className="mt-8 px-6 py-2 border border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold uppercase tracking-widest transition-colors"
            >
              CORTAR LINK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
