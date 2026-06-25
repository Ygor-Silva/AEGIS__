import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, Terminal, User, RefreshCw, ArrowLeft, HelpCircle, Key, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ToastContainer, { emitToast } from './Toast';
import logoUrl from "../assets/images/aegis_logo_1782329274884.jpg";

interface LocalUser {
  operatorId: string;
  accessCode: string;
  securityQuestion: string;
  securityAnswer: string;
}

export default function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [operatorId, setOperatorId] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  
  // Sign up states
  const [signupId, setSignupId] = useState('');
  const [signupCode, setSignupCode] = useState('');
  const [signupConfirmCode, setSignupConfirmCode] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('favorite_tech');
  const [securityAnswer, setSecurityAnswer] = useState('');

  // Forgot password states
  const [forgotId, setForgotId] = useState('');
  const [foundQuestion, setFoundQuestion] = useState('');
  const [recoveryAnswer, setRecoveryAnswer] = useState('');
  const [recoveredCode, setRecoveredCode] = useState('');
  const [stepForgot, setStepForgot] = useState<1 | 2>(1); // 1 = enter ID, 2 = answer question

  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize default admin user if not present
  useEffect(() => {
    const existing = localStorage.getItem('aegis_users');
    if (!existing) {
      const defaultAdmin: LocalUser = {
        operatorId: 'admin',
        accessCode: 'admin',
        securityQuestion: 'favorite_tech',
        securityAnswer: 'aegis'
      };
      localStorage.setItem('aegis_users', JSON.stringify([defaultAdmin]));
    }
  }, []);

  const getUsers = (): LocalUser[] => {
    try {
      return JSON.parse(localStorage.getItem('aegis_users') || '[]');
    } catch {
      return [];
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) {
      emitToast("Código de acesso necessário.", "error");
      return;
    }

    setIsProcessing(true);
    emitToast("Autenticando com canal neural seguro...", "info");

    setTimeout(() => {
      const users = getUsers();
      // Check code against all operators (since we can login directly via code,
      // or optionally look up the operatorId if they provided one, otherwise allow either matches).
      // If operatorId is entered, we look up that specific user.
      const matchedUser = users.find(u => 
        (operatorId.trim() ? u.operatorId.toLowerCase() === operatorId.trim().toLowerCase() : true) && 
        u.accessCode === accessCode
      );

      if (matchedUser || accessCode === 'admin') {
        emitToast(`Acesso autorizado. Bem-vindo, Operador ${matchedUser ? matchedUser.operatorId.toUpperCase() : 'ADMIN'}.`, "success");
        setTimeout(onLogin, 800);
      } else {
        emitToast("Código ou ID do Operador inválido. Acesso negado.", "error");
        setIsProcessing(false);
      }
    }, 1200);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupId.trim()) {
      emitToast("Informe um ID de Operador válido.", "error");
      return;
    }
    if (signupCode.length < 4) {
      emitToast("O código de acesso deve ter pelo menos 4 caracteres.", "error");
      return;
    }
    if (signupCode !== signupConfirmCode) {
      emitToast("Os códigos de acesso informados não coincidem.", "error");
      return;
    }
    if (!securityAnswer.trim()) {
      emitToast("Responda à pergunta de segurança para recuperação.", "error");
      return;
    }

    setIsProcessing(true);
    emitToast("Criando credenciais de rede...", "info");

    setTimeout(() => {
      const users = getUsers();
      const exists = users.some(u => u.operatorId.toLowerCase() === signupId.trim().toLowerCase());

      if (exists) {
        emitToast("Este ID de Operador já está em uso.", "error");
        setIsProcessing(false);
        return;
      }

      const newUser: LocalUser = {
        operatorId: signupId.trim(),
        accessCode: signupCode,
        securityQuestion,
        securityAnswer: securityAnswer.trim().toLowerCase()
      };

      localStorage.setItem('aegis_users', JSON.stringify([...users, newUser]));
      emitToast("Nova conta criada com sucesso! Redirecionando...", "success");
      
      // Clean up fields and switch to login
      setOperatorId(signupId.trim());
      setAccessCode(signupCode);
      setSignupId('');
      setSignupCode('');
      setSignupConfirmCode('');
      setSecurityAnswer('');
      setIsProcessing(false);
      setMode('login');
    }, 1500);
  };

  const handleFindUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotId.trim()) {
      emitToast("Insira o ID do Operador.", "error");
      return;
    }

    const users = getUsers();
    const user = users.find(u => u.operatorId.toLowerCase() === forgotId.trim().toLowerCase());

    if (!user) {
      emitToast("Operador não localizado no mainframe.", "error");
      return;
    }

    let questionText = "Qual o seu animal preferido?";
    if (user.securityQuestion === 'favorite_tech') {
      questionText = "Tecnologia preferida?";
    } else if (user.securityQuestion === 'birth_city') {
      questionText = "Qual a sua cidade natal?";
    } else if (user.securityQuestion === 'mother_name') {
      questionText = "Nome da sua mãe?";
    }

    setFoundQuestion(questionText);
    setStepForgot(2);
    emitToast("Usuário localizado. Insira a resposta de segurança.", "info");
  };

  const handleVerifyForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryAnswer.trim()) {
      emitToast("Informe a resposta de segurança.", "error");
      return;
    }

    setIsProcessing(true);
    emitToast("Descriptografando código de acesso...", "info");

    setTimeout(() => {
      const users = getUsers();
      const user = users.find(u => u.operatorId.toLowerCase() === forgotId.trim().toLowerCase());

      if (user && user.securityAnswer.toLowerCase() === recoveryAnswer.trim().toLowerCase()) {
        setRecoveredCode(user.accessCode);
        emitToast("Chave descriptografada com sucesso!", "success");
      } else {
        emitToast("Falha de segurança. Resposta incorreta.", "error");
      }
      setIsProcessing(false);
    }, 1200);
  };

  const getQuestionPlaceholder = () => {
    if (securityQuestion === 'favorite_tech') return "Ex: Inteligência Artificial / React";
    if (securityQuestion === 'birth_city') return "Ex: São Paulo / Rio de Janeiro";
    if (securityQuestion === 'mother_name') return "Nome da sua mãe";
    return "Resposta de segurança";
  };

  return (
    <div className="min-h-screen bg-[#020408] text-[var(--theme-color)] flex flex-col items-center justify-center p-4 relative overflow-y-auto font-sans">
      {/* Matrix background grid */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(var(--theme-color) 1px, transparent 1px), linear-gradient(90deg, var(--theme-color) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 w-full max-w-md flex flex-col items-center my-8"
      >
        <div className="relative mb-6 group">
          <div className="absolute inset-0 bg-[var(--theme-color)] blur-[45px] opacity-20 group-hover:opacity-40 transition-opacity rounded-full duration-1000" />
          <img src={logoUrl} alt="A.E.G.I.S. Logo" className="w-28 h-28 rounded-full border-2 border-[var(--theme-color)]/50 shadow-[0_0_25px_var(--theme-color)40] relative z-10 object-cover" />
        </div>
        
        <div className="text-center mb-6">
          <h1 className="text-3xl font-black tracking-[0.25em] mb-1 uppercase drop-shadow-[0_0_10px_var(--theme-color)]">A.E.G.I.S.</h1>
          <p className="text-base uppercase tracking-widest opacity-60 font-mono">Assistente Especializado de Gestão e Inteligência de Saldos</p>
        </div>

        <div className="w-full bg-black/80 border border-[var(--theme-color)]/20 p-6 backdrop-blur-sm relative">
          {/* Cyberpunk corner borders */}
          <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--theme-color)]" />
          <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--theme-color)]" />
          <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--theme-color)]" />
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--theme-color)]" />

          <AnimatePresence mode="wait">
            {/* 1. LOGIN MODE */}
            {mode === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="mb-4 flex items-center justify-between border-b border-[var(--theme-color)]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-[var(--theme-color)]" />
                    <span className="text-base uppercase font-mono text-[var(--theme-color)] tracking-wider">LOGIN_SESSÃO</span>
                  </div>
                  <span className="text-base font-mono opacity-50">V4.9_ACTIVE</span>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <label className="block text-base uppercase text-[var(--theme-color)]/70 font-mono">ID DO OPERADOR (OPCIONAL)</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-color)]/50" />
                      <input
                        type="text"
                        value={operatorId}
                        onChange={(e) => setOperatorId(e.target.value)}
                        placeholder="EX: ADMIN / MEU_ID"
                        className="w-full bg-[#0a1a2f]/40 border border-[var(--theme-color)]/30 py-2.5 pl-10 pr-4 text-base text-[var(--theme-color)] placeholder-[var(--theme-color)]/30 outline-none focus:border-[var(--theme-color)] transition-colors font-mono"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-base uppercase text-[var(--theme-color)]/70 font-mono">CÓDIGO DE ACESSO</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--theme-color)]/50" />
                      <input
                        type={showCode ? "text" : "password"}
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value)}
                        placeholder="DIGITE SEU CÓDIGO (admin)"
                        className="w-full bg-[#0a1a2f]/40 border border-[var(--theme-color)]/30 py-2.5 pl-10 pr-10 text-base text-[var(--theme-color)] placeholder-[var(--theme-color)]/30 outline-none focus:border-[var(--theme-color)] transition-colors font-mono tracking-[0.15em]"
                        disabled={isProcessing}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode(!showCode)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--theme-color)]/50 hover:text-[var(--theme-color)]"
                      >
                        {showCode ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-3 mt-2 bg-[var(--theme-color)]/10 border border-[var(--theme-color)]/50 text-[var(--theme-color)] hover:bg-[var(--theme-color)] hover:text-black transition-all flex items-center justify-center gap-2 text-base font-bold tracking-widest uppercase group relative overflow-hidden cursor-pointer"
                  >
                    {isProcessing ? (
                      <Terminal size={16} className="animate-pulse" />
                    ) : (
                      <Fingerprint size={16} className="group-hover:scale-110 transition-transform" />
                    )}
                    <span>{isProcessing ? 'CONECTANDO...' : 'INICIAR SESSÃO'}</span>
                  </button>
                </form>

                {/* Custom cyberpunk link section */}
                <div className="pt-4 flex items-center justify-between border-t border-[var(--theme-color)]/10 text-base font-mono">
                  <button 
                    onClick={() => {
                      setStepForgot(1);
                      setForgotId('');
                      setRecoveryAnswer('');
                      setRecoveredCode('');
                      setMode('forgot');
                    }}
                    className="text-white/60 hover:text-[#ff0055] transition-colors flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Key size={12} /> Esqueceu a senha?
                  </button>
                  <button 
                    onClick={() => setMode('signup')}
                    className="text-[var(--theme-color)] hover:text-white transition-colors flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    Criar conta nova &gt;
                  </button>
                </div>
              </motion.div>
            )}

            {/* 2. CREATE ACCOUNT MODE */}
            {mode === 'signup' && (
              <motion.div
                key="signup"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="space-y-4"
              >
                <div className="mb-4 flex items-center justify-between border-b border-[var(--theme-color)]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <User size={18} className="text-[#00d4ff]" />
                    <span className="text-base uppercase font-mono text-[#00d4ff] tracking-wider font-bold">CRIAR_CONTA_REDE</span>
                  </div>
                  <button 
                    onClick={() => setMode('login')}
                    className="text-base font-mono text-[var(--theme-color)]/80 hover:text-[var(--theme-color)] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> VOLTAR
                  </button>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3">
                  <div className="space-y-1">
                    <label className="block text-base uppercase text-[#00d4ff]/70 font-mono">CRIE SEU ID DE OPERADOR</label>
                    <div className="relative">
                      <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/50" />
                      <input
                        type="text"
                        required
                        value={signupId}
                        onChange={(e) => setSignupId(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                        placeholder="EX: CYBER_PUNK_2026"
                        className="w-full bg-[#0a1a2f]/40 border border-[#00d4ff]/30 py-2 pl-10 pr-4 text-base text-[#00d4ff] placeholder-[#00d4ff]/30 outline-none focus:border-[#00d4ff] transition-colors font-mono"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-base uppercase text-[#00d4ff]/70 font-mono">CÓDIGO DE ACESSO (MÍN. 4 CARAC.)</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/50" />
                      <input
                        type="password"
                        required
                        value={signupCode}
                        onChange={(e) => setSignupCode(e.target.value)}
                        placeholder="CRIAR CÓDIGO"
                        className="w-full bg-[#0a1a2f]/40 border border-[#00d4ff]/30 py-2 pl-10 pr-4 text-base text-[#00d4ff] placeholder-[#00d4ff]/30 outline-none focus:border-[#00d4ff] transition-colors font-mono tracking-[0.15em]"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-base uppercase text-[#00d4ff]/70 font-mono">CONFIRME SEU CÓDIGO</label>
                    <div className="relative">
                      <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00d4ff]/50" />
                      <input
                        type="password"
                        required
                        value={signupConfirmCode}
                        onChange={(e) => setSignupConfirmCode(e.target.value)}
                        placeholder="CONFIRMAR CÓDIGO"
                        className="w-full bg-[#0a1a2f]/40 border border-[#00d4ff]/30 py-2 pl-10 pr-4 text-base text-[#00d4ff] placeholder-[#00d4ff]/30 outline-none focus:border-[#00d4ff] transition-colors font-mono tracking-[0.15em]"
                        disabled={isProcessing}
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1 border-t border-[#00d4ff]/10">
                    <label className="block text-base uppercase text-[#00d4ff]/70 font-mono flex items-center gap-1">
                      <HelpCircle size={11} /> PERGUNTA DE SEGURANÇA (RECUPERAÇÃO)
                    </label>
                    <select
                      value={securityQuestion}
                      onChange={(e) => setSecurityQuestion(e.target.value)}
                      className="w-full bg-[#0a1a2f]/40 border border-[#00d4ff]/30 py-2 px-3 text-base text-[#00d4ff] outline-none focus:border-[#00d4ff] font-mono appearance-none"
                    >
                      <option value="favorite_tech" className="bg-[#020408]">Tecnologia ou Framework preferida?</option>
                      <option value="birth_city" className="bg-[#020408]">Qual a sua cidade de nascimento?</option>
                      <option value="mother_name" className="bg-[#020408]">Qual o nome da sua mãe?</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <input
                      type="text"
                      required
                      value={securityAnswer}
                      onChange={(e) => setSecurityAnswer(e.target.value)}
                      placeholder={getQuestionPlaceholder()}
                      className="w-full bg-[#0a1a2f]/40 border border-[#00d4ff]/30 py-2 px-3 text-base text-[#00d4ff] placeholder-[#00d4ff]/30 outline-none focus:border-[#00d4ff] transition-colors font-mono"
                      disabled={isProcessing}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full py-2.5 mt-2 bg-[#00d4ff]/10 border border-[#00d4ff]/50 text-[#00d4ff] hover:bg-[#00d4ff] hover:text-black transition-all flex items-center justify-center gap-2 text-base font-bold tracking-widest uppercase cursor-pointer"
                  >
                    <Terminal size={14} className={isProcessing ? "animate-pulse" : ""} />
                    <span>{isProcessing ? "REGISTRANDO..." : "CONFIRMAR CADASTRO"}</span>
                  </button>
                </form>

                <div className="text-center pt-3 border-t border-[#00d4ff]/10">
                  <button 
                    onClick={() => setMode('login')}
                    className="text-base font-mono text-[var(--theme-color)] hover:underline hover:text-white cursor-pointer"
                  >
                    Já possui conta? Inicie a sessão
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. FORGOT PASSWORD MODE */}
            {mode === 'forgot' && (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="mb-4 flex items-center justify-between border-b border-[var(--theme-color)]/10 pb-3">
                  <div className="flex items-center gap-2">
                    <Key size={18} className="text-[#ff0055]" />
                    <span className="text-base uppercase font-mono text-[#ff0055] tracking-wider font-bold">RECUPERAR_CHAVE_ACESSO</span>
                  </div>
                  <button 
                    onClick={() => setMode('login')}
                    className="text-base font-mono text-[var(--theme-color)]/80 hover:text-[var(--theme-color)] flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft size={12} /> CANCELAR
                  </button>
                </div>

                {stepForgot === 1 ? (
                  <form onSubmit={handleFindUser} className="space-y-4">
                    <p className="text-base font-mono opacity-80 leading-relaxed">
                      Insira o seu ID de Operador registrado. O sistema localizará a sua pergunta secreta de calibração.
                    </p>
                    <div className="space-y-1">
                      <label className="block text-base uppercase text-[#ff0055]/70 font-mono">ID DO OPERADOR</label>
                      <div className="relative">
                        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#ff0055]/50" />
                        <input
                          type="text"
                          required
                          value={forgotId}
                          onChange={(e) => setForgotId(e.target.value)}
                          placeholder="EX: MEU_ID"
                          className="w-full bg-[#0a1a2f]/40 border border-[#ff0055]/30 py-2.5 pl-10 pr-4 text-base text-[#ff0055] placeholder-[#ff0055]/30 outline-none focus:border-[#ff0055] transition-colors font-mono"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2.5 bg-[#ff0055]/10 border border-[#ff0055]/50 text-[#ff0055] hover:bg-[#ff0055] hover:text-black transition-all flex items-center justify-center gap-2 text-base font-bold tracking-widest uppercase cursor-pointer"
                    >
                      <RefreshCw size={14} />
                      PESQUISAR NO MAINFRAME
                    </button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 bg-[#ff0055]/5 border border-[#ff0055]/20 font-mono">
                      <div className="text-base uppercase opacity-40 mb-1">PERGUNTA SECRETA</div>
                      <div className="text-base text-white flex items-center gap-1">
                        <HelpCircle size={14} className="text-[#ff0055]" />
                        {foundQuestion}
                      </div>
                    </div>

                    {!recoveredCode ? (
                      <form onSubmit={handleVerifyForgot} className="space-y-4">
                        <div className="space-y-1">
                          <label className="block text-base uppercase text-[#ff0055]/70 font-mono">SUA RESPOSTA</label>
                          <input
                            type="text"
                            required
                            value={recoveryAnswer}
                            onChange={(e) => setRecoveryAnswer(e.target.value)}
                            placeholder="SUA RESPOSTA"
                            className="w-full bg-[#0a1a2f]/40 border border-[#ff0055]/30 py-2.5 px-3 text-base text-[#ff0055] placeholder-[#ff0055]/30 outline-none focus:border-[#ff0055] transition-colors font-mono"
                            disabled={isProcessing}
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={isProcessing}
                          className="w-full py-2.5 bg-[#ff0055]/10 border border-[#ff0055]/50 text-[#ff0055] hover:bg-[#ff0055] hover:text-black transition-all flex items-center justify-center gap-2 text-base font-bold tracking-widest uppercase cursor-pointer"
                        >
                          <Terminal size={14} className={isProcessing ? "animate-pulse" : ""} />
                          {isProcessing ? "DESCRIPTOGRAFANDO..." : "VALIDAR RESPOSTA"}
                        </button>
                      </form>
                    ) : (
                      <div className="space-y-4 p-4 border border-[var(--theme-color)]/30 bg-[var(--theme-color)]/5 font-mono text-center">
                        <div className="text-base text-[var(--theme-color)] tracking-wider uppercase font-bold">CHAVE RECUPERADA COM SUCESSO!</div>
                        <div className="text-lg text-white font-bold tracking-widest border border-dashed border-[var(--theme-color)]/40 py-2 bg-black/60">
                          {recoveredCode}
                        </div>
                        <button
                          onClick={() => {
                            setOperatorId(forgotId);
                            setAccessCode(recoveredCode);
                            setMode('login');
                          }}
                          className="w-full py-2 bg-[var(--theme-color)]/20 border border-[var(--theme-color)] text-[var(--theme-color)] hover:bg-[var(--theme-color)] hover:text-black transition-all text-base font-bold tracking-widest uppercase cursor-pointer"
                        >
                          CONECTAR COM ESSA CHAVE
                        </button>
                      </div>
                    )}
                  </div>
                )}

                <div className="text-center pt-3 border-t border-[#ff0055]/10">
                  <button 
                    onClick={() => {
                      setStepForgot(1);
                      setForgotId('');
                      setMode('login');
                    }}
                    className="text-base font-mono text-[var(--theme-color)] hover:underline cursor-pointer"
                  >
                    Voltar ao login
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <div className="mt-6 flex gap-1 opacity-30">
          <div className="w-1 h-1 bg-[var(--theme-color)]" />
          <div className="w-1 h-1 bg-[var(--theme-color)]" />
          <div className="w-4 h-1 bg-[var(--theme-color)]" />
        </div>
      </motion.div>
      <ToastContainer />
    </div>
  );
}
