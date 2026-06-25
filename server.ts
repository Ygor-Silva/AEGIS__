import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import multer from "multer";
import { WebSocketServer } from "ws";
import * as http from "http";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    },
  },
});

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);
  const wss = new WebSocketServer({ server, path: '/live' });

  app.use(express.json({ limit: "50mb" }));

  // Chat API using gemini-3.5-flash for complex tasks (including images)
  app.post("/api/chat", async (req, res) => {
    try {
      const { contents } = req.body;
      const openRouterKey = (req.headers["x-openrouter-key"] as string) || process.env.OPENROUTER_API_KEY;
      const openRouterModel = (req.headers["x-openrouter-model"] as string) || "openrouter/auto";

      const systemInstruction = `Você é um Consultor Financeiro Pessoal (A.E.G.I.S. - Assistente Especializado em Gestão e Inteligência de Saldos) focado em planejamento prático, redução de custos e inteligência financeira. Sua missão é interagir com o usuário pelo chat do aplicativo, oferecendo dicas de economia, análise de orçamento e estratégias para melhorar o custo-benefício do dia a dia.

Seu Perfil e Tom de Voz:
- Prático e Direto: Responda sem rodeios. Use linguagem acessível, mas demonstre autoridade financeira.
- Foco em Otimização: Você sempre busca a melhor relação custo-benefício (seja para compras, viagens ou contas fixas).
- Empático, mas Realista: Celebre o controle de gastos, mas alerte de forma educada quando notar desperdícios.

Regras de Estruturação da Resposta:
Para que o aplicativo processe sua resposta corretamente, você deve Sempre dividir sua resposta em três blocos bem definidos, usando a exata formatação abaixo. Nunca fuja desse padrão.

[MENSAGEM]
(Escreva aqui a sua resposta conversacional para o usuário, tirando a dúvida ou dando o conselho. Seja natural e interativo. Se for um processamento de imagem/comprovante de transação, descreva os dados extraídos aqui).

[AÇÃO PRÁTICA]
(Escreva aqui em 1 ou 2 bullet points o que o usuário deve fazer agora em relação ao que foi conversado).

[TAGS]
(Forneça de 1 a 3 palavras-chave sobre o tema da conversa separadas por vírgula. Ex: Economia, Supermercado, Investimento).

Restrições:
- Não invente dados bancários.
- Se o usuário fizer perguntas fora do escopo financeiro ou de organização de rotina, traga o assunto de volta para finanças.`;

      if (openRouterKey) {
        const messages = [{ role: "system", content: systemInstruction }];
        if (Array.isArray(contents)) {
          for (const item of contents) {
            if (item.parts && Array.isArray(item.parts)) {
              for (const part of item.parts) {
                if (part.text) {
                  messages.push({ role: item.role === "user" ? "user" : "assistant", content: part.text });
                } else if (part.inlineData) {
                  messages.push({ 
                    role: "user", 
                    content: `[IMAGEM ENVIADA - Formato Mime: ${part.inlineData.mimeType}] Processe a imagem em anexo.` 
                  });
                }
              }
            } else if (typeof item === 'string') {
              messages.push({ role: "user", content: item });
            }
          }
        } else {
          messages.push({ role: "user", content: String(contents) });
        }

        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "A.E.G.I.S. Financial Terminal"
          },
          body: JSON.stringify({
            model: openRouterModel,
            messages,
            temperature: 0.3
          })
        });

        if (openRouterResponse.ok) {
          const data = await openRouterResponse.json();
          const text = data.choices?.[0]?.message?.content || "";
          return res.json({ text });
        } else {
          console.warn("OpenRouter API returned error, falling back to local Gemini...");
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes("429") || error.message.includes("503"))) {
        return res.json({ text: "🟢 [SISTEMA: SOBRECARGA DETECTADA]\nOs servidores centrais estão operando no limite de processamento. A inteligência de dados retornará em breve. Por favor, aguarde alguns segundos e tente novamente." });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Audio Transcription using gemini-3.5-flash
  app.post("/api/transcribe", upload.single("audio"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No audio file provided" });
      }

      let mimeType = req.file.mimetype.split(";")[0].trim();
      if (mimeType === "application/octet-stream" || !mimeType.startsWith("audio/")) {
        mimeType = "audio/webm";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType,
                  data: req.file.buffer.toString("base64"),
                },
              },
              {
                text: "Transcribe the audio. Respond only with the transcription, nothing else.",
              },
            ],
          },
        ],
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes("429") || error.message.includes("503"))) {
         return res.json({ text: "[SISTEMA: TRANSCRIÇÃO INDISPONÍVEL DEVIDO A ALTA DEMANDA]" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Text to Speech using gemini-3.1-flash-tts-preview
  app.post("/api/tts", async (req, res) => {
    try {
      const { text } = req.body;
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: "Puck" },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      res.json({ audio: base64Audio });
    } catch (error: any) {
      console.error(error);
      if (error.message && (error.message.includes("429") || error.message.includes("503"))) {
         return res.json({ audio: null });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Categorize API using gemini-3.5-flash or OpenRouter
  app.post("/api/categorize", async (req, res) => {
    try {
      const { description } = req.body;
      const openRouterKey = (req.headers["x-openrouter-key"] as string) || process.env.OPENROUTER_API_KEY;
      const openRouterModel = (req.headers["x-openrouter-model"] as string) || "openrouter/auto";

      const prompt = `Analise a seguinte descrição de despesa e sugira a melhor categoria financeira (ex: Alimentação, Transporte, Lazer, Saúde, Educação, Moradia, Serviços, Assinaturas, Outros). Responda APENAS com o nome da categoria.\n\nDescrição: ${description}`;

      if (openRouterKey) {
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ai.studio/build",
            "X-Title": "A.E.G.I.S. Financial Terminal"
          },
          body: JSON.stringify({
            model: openRouterModel,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.1
          })
        });

        if (openRouterResponse.ok) {
          const data = await openRouterResponse.json();
          const category = data.choices?.[0]?.message?.content?.trim() || "Outros";
          return res.json({ category });
        } else {
          console.warn("OpenRouter API for categorization failed, falling back to local Gemini...");
        }
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          temperature: 0.1,
        },
      });

      res.json({ category: response.text?.trim() });
    } catch (error: any) {
      console.error(error);
      // Fallback for API limit or high demand
      if (error.message && (error.message.includes("429") || error.message.includes("503"))) {
         return res.json({ category: "Outros" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Dedicated OpenRouter Chat Proxy API
  app.post("/api/openrouter/chat", async (req, res) => {
    try {
      const apiKey = (req.headers["x-openrouter-key"] as string) || process.env.OPENROUTER_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ 
          error: "A chave API do OpenRouter não está configurada. Configure-a no painel de Configurações do App." 
        });
      }

      const { model, messages, temperature } = req.body;
      const openRouterModel = model || (req.headers["x-openrouter-key"] ? (req.headers["x-openrouter-model"] as string) : null) || "openrouter/auto";

      const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://ai.studio/build",
          "X-Title": "A.E.G.I.S. Financial Terminal"
        },
        body: JSON.stringify({
          model: openRouterModel,
          messages: messages || [],
          temperature: temperature ?? 0.7
        })
      });

      if (!openRouterResponse.ok) {
        const errText = await openRouterResponse.text();
        throw new Error(`OpenRouter API respondeu com status ${openRouterResponse.status}: ${errText}`);
      }

      const data = await openRouterResponse.json();
      res.json(data);
    } catch (error: any) {
      console.error("OpenRouter Proxy Error:", error);
      res.status(500).json({ error: error.message || "Erro de comunicação interna com o OpenRouter" });
    }
  });

  // WebSocket Live API
  wss.on("connection", async (clientWs) => {
    try {
      const session = await ai.live.connect({
        model: "gemini-3.1-flash-live-preview",
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
          },
          systemInstruction: "Você é o A.E.G.I.S., uma IA financeira holográfica focada em precisão e eficiência. Seja direto e pragmático.",
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            const audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audio) clientWs.send(JSON.stringify({ audio }));
            if (message.serverContent?.interrupted)
              clientWs.send(JSON.stringify({ interrupted: true }));
          },
        },
      });

      clientWs.on("message", (data) => {
        try {
          const { audio } = JSON.parse(data.toString());
          if (audio) {
            session.sendRealtimeInput({
              audio: { data: audio, mimeType: "audio/pcm;rate=16000" },
            });
          }
        } catch (e) {
          console.error("Live ws message error:", e);
        }
      });
      
      clientWs.on("close", () => {
         // Cleanup if necessary
      });
    } catch (e) {
      console.error("Live API connection error:", e);
      clientWs.close();
    }
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Global Express Error Caught:", err);
    res.status(err.status || 500).json({ 
      error: err.message || "Erro interno no servidor de dados",
      details: process.env.NODE_ENV !== "production" ? err.stack : undefined
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
