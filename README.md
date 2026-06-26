# 🪙 Kerdos - Sistema de Gestão e Inteligência de Saldos

> **Kerdos** é uma plataforma full-stack de alta performance para controle, projeção e inteligência financeira avançada. Desenvolvido sob os mais rigorosos padrões de arquitetura de software, design de experiência (UX/UI) e segurança de dados, o Kerdos une análises preditivas por regressão linear e inteligência artificial generativa de ponta (Gemini Pro) a um ecossistema visual de alta fidelidade.

---

## 🎨 Design de Experiência & Filosofia Visual

A interface do **Kerdos** foi projetada focando no minimalismo pragmático e na ergonomia visual de ambientes de alta densidade de dados:

*   **Tema "Cosmic Deep Space"**: Paleta de cores em escala de cinzas profundos e azuis fechados, reduzindo a fadiga visual durante análises detalhadas.
*   **Hierarquia Tipográfica Refinada**: Combinação de fontes sans-serif modernas para legibilidade otimizada com fontes monoespaçadas de nível técnico para dados numéricos precisos.
*   **Micro-interações de Fluidez Máxima**: Animações de transição orquestradas via `motion/react` com curvas de aceleração naturais (ease-out).
*   **Gráficos Reativos com High-Fidelity Tooltips**:
    *   **Contenção Dinâmica de Limites**: Tooltips matematicamente projetados para acompanhar a movimentação do cursor de forma suave, impedindo o corte visual nas bordas com uma margem de segurança de `10px`.
    *   **Interatividade Drill-Down**: Ao clicar em pontos específicos do gráfico de Fluxo de Caixa ou de Acúmulo de Saldo, o painel inferior filtra instantaneamente os lançamentos correspondentes através de uma transição colapsável elegante.

---

## 🚀 Recursos Principais

### 📊 Painel Inteligente & Predição Analítica (Smart Dashboard)
*   **Análise Preditiva EOM (End-of-Month)**: Motor estatístico que aplica **Regressão Linear** sobre o histórico de despesas e receitas para projetar o saldo restante exato ao término do mês corrente.
*   **Composição de Gastos (50/30/20)**: Classificação automatizada que segmenta saídas em Necessidades (50%), Desejos (30%) e Poupança/Investimentos (20%), dando clareza sobre hábitos financeiros.
*   **Filtros de Tendência Cruzados**: Alternância instantânea entre visualização de receitas, despesas ou consolidado histórico.

### 🧠 Core de Inteligência Artificial (Google Gemini Integration)
*   **Server-Side Gemini API Proxy**: Toda a comunicação com o ecossistema do Google GenAI ocorre de forma estritamente server-side (Express backend), protegendo as chaves de API contra interceptação no browser.
*   **Chat Financeiro Dedicado**: Um assistente cognitivo integrado que analisa as transações atuais e fornece feedbacks direcionados, sugestões de economia e metas customizadas.
*   **Categorização Automática Inteligente**: Lançamentos manuais são categorizados instantaneamente por inferência semântica de IA.
*   **Resiliência e Tolerância a Falhas**: Tratamento avançado de limites de requisições (Quota Limit 429) com fallback inteligente para dados locais e caches estáticos, garantindo que o app nunca quebre.

### 📈 Relatórios Avançados & Auditoria
*   **Gráficos de Comparativo de Fluxo e Curva de Evolução Patrimonial**: Gráficos complexos e responsivos que servem de âncora para inspecionar os lançamentos em profundidade.
*   **Lista de Auditoria Colapsável**: Painel colapsável integrado diretamente abaixo do gráfico de fluxo de caixa que reage em tempo real a cliques em barras de categorias ou meses específicos.
*   **Exportação em Lote para PDF**: Motor interno baseado em `jspdf` e `jspdf-autotable` para geração de relatórios físicos formatados com design executivo profissional prontos para auditoria.

### 🛡️ Segurança e Robustez Técnica
*   **Isolamento de Credenciais**: Chaves secretas não expostas via cliente (`VITE_`). Uso exclusivo de variáveis de ambiente server-side (`process.env.GEMINI_API_KEY`).
*   **Proteção contra Vulnerabilidades de Front-End**: Sanitização ativa contra injeções de script (XSS) e prevenção de mutações inesperadas de estado em loops de renderização do React (`useEffect` altamente estabilizados).
*   **Persistência Híbrida**: Sincronização em tempo real de dados críticos com o **Supabase Database** com fallback local robusto estruturado em `localStorage`.

---

## 📂 Arquitetura do Projeto

O código-fonte segue as melhores práticas de modularidade, separação de conceitos e facilidade de manutenção:

```
├── server.ts               # Servidor Express Full-stack unificado & Proxy de IA
├── src/
│   ├── App.tsx             # Orquestrador principal da visualização SPA
│   ├── index.css           # Estilos e declarações globais com Tailwind CSS
│   ├── types.ts            # Tipagens e interfaces TypeScript unificadas
│   ├── components/         # Módulos e Componentes visuais encapsulados
│   │   ├── SmartDashboard.tsx      # Dashboard central com predição analítica
│   │   ├── ReportsTab.tsx          # Painel de relatórios integrados, tooltips e PDF
│   │   ├── SpendingTrendChart.tsx  # Gráfico de evolução de despesas suavizado
│   │   ├── AiInsights.tsx          # Motor de insights gerenciais de IA
│   │   ├── ChatInterface.tsx       # Interface de conversação com o consultor financeiro
│   │   ├── GoalsProgress.tsx       # Monitor de objetivos de curto/médio prazo
│   │   ├── MarketNews.tsx          # Feed de notícias econômicas em tempo real
│   │   └── ...                     # Demais modulares e utilitários UI
│   └── utils/              # Funções utilitárias puras de apoio
```

---

## 🛠️ Tecnologias Utilizadas

### Front-End (SPA)
*   **React 19** + **TypeScript** (Estreita tipagem estática e interfaces limpas)
*   **Vite** (Ambiente de desenvolvimento ultrarrápido)
*   **Tailwind CSS v4** (Estilização atômica de alta performance)
*   **Motion / Framer Motion** (Animações fluidas de estado e layout)
*   **Recharts 3** (Geração de gráficos complexos com manipulação de cursor vetorial)
*   **Driver.js** (Guia interativo integrado de onboarding)

### Back-End (Server)
*   **Node.js** com **Express** (Roteamento robusto de APIs)
*   **Google GenAI SDK (`@google/genai`)** (Integração oficial de inteligência)
*   **Esbuild / Tsx** (Build unificado e execução otimizada de TypeScript)
*   **Supabase** (Armazenamento em Nuvem e sincronização em tempo real)

---

## ⚙️ Inicialização e Configuração

### Pré-requisitos
*   Node.js (versão 18 ou superior)
*   NPM ou Yarn

### Instalação

1. Clone o repositório para o seu ambiente local:
   ```bash
   git clone https://github.com/seu-usuario/kerdos.git
   cd kerdos
   ```

2. Instale as dependências de desenvolvimento e produção:
   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente necessárias. Crie um arquivo `.env` na raiz do projeto com base no modelo `.env.example`:
   ```env
   # .env
   GEMINI_API_KEY=sua_chave_da_api_do_gemini_aqui
   SUPABASE_URL=seu_endpoint_do_supabase_aqui
   SUPABASE_ANON_KEY=sua_chave_publica_do_supabase_aqui
   ```

### Executando em Desenvolvimento

Inicie o servidor de desenvolvimento e o proxy unificado na porta local:
```bash
npm run dev
```
O servidor de desenvolvimento estará ativo e servindo a aplicação em: `http://localhost:3000`

### Build para Produção

Para gerar a distribuição otimizada para implantação em produção:
```bash
npm run build
```
Esse comando compilará o front-end na pasta `/dist` e criará um bundle CJS consolidado e autocontido do backend em `dist/server.cjs` utilizando o **esbuild**.

Para iniciar em modo produção:
```bash
npm start
```

---

## 🛡️ Segurança de Dados Aplicada

1.  **Exclusão de Chaves Públicas**: Nenhuma credencial crítica ou chave secreta de IA é injetada na compilação do lado do cliente.
2.  **Middlewares de Tratamento de Erros**: O servidor gerencia e isola mensagens de erro críticas do sistema para que nunca vazem metadados sensíveis do ambiente ou do banco de dados na resposta HTTP.
3.  **Sanitização de Input**: Prevenção ativa de Cross-Site Scripting (XSS) no tratamento das interações de chat e lançamentos de transações textuais.

---

<p align="center">
  Desenvolvido com excelência técnica para o gerenciamento de patrimônio pessoal e inteligência de dados.
</p>
