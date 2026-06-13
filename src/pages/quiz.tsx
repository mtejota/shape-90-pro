import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";

const QUIZ_KEY = "shape90:quiz";
const CHECKOUT_URL = "https://pay.cakto.com.br/5qheonk_881138";
const TOTAL_STEPS = 9;

type QuizAnswers = {
  objetivo: string;
  nivel: string;
  local: string;
  dias: string;
  duracao: string;
  idade: string;
  peso: string;
  altura: string;
  limitacoes: string;
};

type CardOption = { value: string; label: string; emoji: string; desc?: string };

type Step = {
  key: keyof QuizAnswers;
  question: string;
  sub: string;
  type: "cards" | "input" | "textarea";
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  placeholder?: string;
  options?: CardOption[];
  optional?: boolean;
};

const STEPS: Step[] = [
  {
    key: "objetivo",
    question: "Qual é o seu objetivo principal?",
    sub: "Isso define toda a estrutura do seu plano",
    type: "cards",
    options: [
      { value: "hipertrofia", label: "Ganhar Massa", emoji: "💪", desc: "Aumentar volume muscular" },
      { value: "definicao", label: "Definição", emoji: "✂️", desc: "Secar mantendo músculo" },
      { value: "emagrecimento", label: "Emagrecimento", emoji: "🔥", desc: "Perder peso com saúde" },
    ],
  },
  {
    key: "nivel",
    question: "Qual é o seu nível de experiência?",
    sub: "Seja honesto — o plano é feito para o seu nível",
    type: "cards",
    options: [
      { value: "iniciante", label: "Iniciante", emoji: "🌱", desc: "Menos de 1 ano treinando" },
      { value: "intermediario", label: "Intermediário", emoji: "⚡", desc: "1 a 3 anos treinando" },
      { value: "avancado", label: "Avançado", emoji: "🏆", desc: "Mais de 3 anos treinando" },
    ],
  },
  {
    key: "local",
    question: "Onde você vai treinar?",
    sub: "Seu plano será adaptado para o local escolhido",
    type: "cards",
    options: [
      { value: "academia", label: "Academia", emoji: "🏋️", desc: "Equipamentos completos" },
      { value: "casa", label: "Em casa", emoji: "🏠", desc: "Halteres / elásticos" },
      { value: "sem_equipamento", label: "Sem equipamento", emoji: "🤸", desc: "Peso corporal" },
    ],
  },
  {
    key: "dias",
    question: "Quantos dias por semana você pode treinar?",
    sub: "Escolha o que se encaixa na sua rotina real",
    type: "cards",
    options: [
      { value: "2", label: "2 dias", emoji: "2" },
      { value: "3", label: "3 dias", emoji: "3" },
      { value: "4", label: "4 dias", emoji: "4" },
      { value: "5", label: "5 dias", emoji: "5" },
      { value: "6", label: "6 dias", emoji: "6" },
      { value: "7", label: "7 dias", emoji: "7" },
    ],
  },
  {
    key: "duracao",
    question: "Quanto tempo você tem por treino?",
    sub: "Isso define o volume e a densidade de cada sessão",
    type: "cards",
    options: [
      { value: "30", label: "30 min", emoji: "⚡", desc: "Rápido e direto" },
      { value: "45", label: "45 min", emoji: "🕐", desc: "Sessão moderada" },
      { value: "60", label: "60 min", emoji: "💪", desc: "Treino completo" },
      { value: "90", label: "90 min+", emoji: "🔥", desc: "Longa duração" },
    ],
  },
  {
    key: "idade",
    question: "Qual é a sua idade?",
    sub: "Usamos isso para calibrar a intensidade e recuperação",
    type: "input",
    inputMode: "numeric",
    placeholder: "Ex: 25",
  },
  {
    key: "peso",
    question: "Qual é o seu peso atual?",
    sub: "Em quilogramas (kg)",
    type: "input",
    inputMode: "decimal",
    placeholder: "Ex: 80",
  },
  {
    key: "altura",
    question: "Qual é a sua altura?",
    sub: "Em centímetros ou metros (ex: 175 ou 1,75)",
    type: "input",
    inputMode: "decimal",
    placeholder: "Ex: 175",
  },
  {
    key: "limitacoes",
    question: "Você tem alguma lesão ou limitação física?",
    sub: "Opcional — deixe em branco se não tiver nenhuma",
    type: "textarea",
    placeholder: "Ex: dor no joelho direito, hérnia de disco...",
    optional: true,
  },
];

const LABEL_MAP: Record<string, Record<string, string>> = {
  objetivo: { hipertrofia: "Ganho de Massa", definicao: "Definição", emagrecimento: "Emagrecimento" },
  nivel: { iniciante: "Iniciante", intermediario: "Intermediário", avancado: "Avançado" },
  local: { academia: "Academia", casa: "Em casa", sem_equipamento: "Sem equipamento" },
  duracao: { "30": "30 min/treino", "45": "45 min/treino", "60": "60 min/treino", "90": "90 min+/treino" },
};

const getInsights = (a: QuizAnswers) => ({
  objetivo:
    a.objetivo === "hipertrofia"
      ? "Seu plano terá foco em volume progressivo e sobrecarga para maximizar ganho muscular."
      : a.objetivo === "definicao"
      ? "Seu plano combinará treino de força com densidade metabólica para definir sem perder massa."
      : "Seu plano priorizará alta queima calórica e consistência para acelerar o metabolismo.",
  nivel:
    a.nivel === "iniciante"
      ? "A progressão será suave e estruturada para você construir a base certa sem risco de lesões."
      : a.nivel === "intermediario"
      ? "Técnicas como superséries e drop-sets serão incluídas para romper platôs de evolução."
      : "Periodização complexa com variações de volume e intensidade semana a semana.",
  dias:
    Number(a.dias) <= 3
      ? `Com ${a.dias} dias disponíveis, usaremos treinos full-body de alta eficiência por sessão.`
      : Number(a.dias) <= 5
      ? `Com ${a.dias} dias, a divisão muscular garantirá volume ideal por grupo por semana.`
      : `Com ${a.dias} dias, seu programa terá alta frequência e volume distribuído de forma inteligente.`,
});

export default function Quiz() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [answers, setAnswers] = useState<QuizAnswers>({
    objetivo: "", nivel: "", local: "", dias: "", duracao: "",
    idade: "", peso: "", altura: "", limitacoes: "",
  });
  const [inputValue, setInputValue] = useState("");
  const [inputError, setInputError] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Resume from a partial quiz saved in localStorage (e.g., objetivo chosen in landing page preview)
  useEffect(() => {
    const saved = localStorage.getItem(QUIZ_KEY);
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === "object") {
        setAnswers((prev) => ({ ...prev, ...parsed }));
        const firstUnanswered = STEPS.findIndex((s) => !parsed[s.key]);
        if (firstUnanswered > 0) setStep(firstUnanswered);
      }
    } catch {
      localStorage.removeItem(QUIZ_KEY);
    }
  }, []);

  const currentStep = STEPS[step];
  const isInputStep = currentStep.type === "input" || currentStep.type === "textarea";

  useEffect(() => {
    if (isInputStep) {
      setInputValue(answers[currentStep.key]);
      setInputError("");
    }
  }, [step]);

  const finalize = (finalAnswers: QuizAnswers) => {
    localStorage.setItem(QUIZ_KEY, JSON.stringify(finalAnswers));
    setAnswers(finalAnswers);
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowResult(true);
    }, 2000);
  };

  const handleCardSelect = (value: string) => {
    const newAnswers = { ...answers, [currentStep.key]: value };
    setAnswers(newAnswers);
    setTimeout(() => {
      if (step === STEPS.length - 1) {
        finalize(newAnswers);
        return;
      }
      setDirection(1);
      setStep((s) => s + 1);
    }, 260);
  };

  const validateInput = (): boolean => {
    const key = currentStep.key;
    if (!currentStep.optional && !inputValue.trim()) {
      setInputError("Por favor, preencha este campo.");
      return false;
    }
    if (key === "idade") {
      const n = Number(inputValue.replace(/\D/g, ""));
      if (!inputValue.trim() || !Number.isInteger(n) || n < 14 || n > 100) {
        setInputError("Informe uma idade válida entre 14 e 100.");
        return false;
      }
    }
    if (key === "peso") {
      const n = parseFloat(inputValue.replace(",", "."));
      if (!inputValue.trim() || isNaN(n) || n < 30 || n > 300) {
        setInputError("Informe um peso válido entre 30 e 300 kg.");
        return false;
      }
    }
    if (key === "altura") {
      let n = parseFloat(inputValue.replace(",", "."));
      if (n > 0 && n < 3) n *= 100;
      if (!inputValue.trim() || isNaN(n) || n < 100 || n > 250) {
        setInputError("Informe a altura em cm ou metros (ex: 175 ou 1,75).");
        return false;
      }
    }
    return true;
  };

  const handleInputContinue = () => {
    if (!validateInput()) return;
    const newAnswers = { ...answers, [currentStep.key]: inputValue.trim() };
    if (step === STEPS.length - 1) {
      finalize(newAnswers);
      return;
    }
    setAnswers(newAnswers);
    setDirection(1);
    setStep((s) => s + 1);
  };

  const handleSkip = () => {
    const newAnswers = { ...answers, [currentStep.key]: "" };
    if (step === STEPS.length - 1) {
      finalize(newAnswers);
      return;
    }
    setAnswers(newAnswers);
    setDirection(1);
    setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step === 0) return;
    setDirection(-1);
    setStep((s) => s - 1);
    setInputError("");
  };

  if (analyzing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-white text-xl font-bold mb-2">Analisando seu perfil...</h2>
          <p className="text-gray-500 text-sm">Preparando sua estratégia personalizada</p>
        </div>
      </div>
    );
  }

  if (showResult) {
    return <ResultScreen answers={answers} />;
  }

  const progress = ((step + 1) / TOTAL_STEPS) * 100;
  const isDaysStep = currentStep.key === "dias";
  const isTwoColStep = (currentStep.options?.length ?? 0) === 4;

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-x-hidden">
      <div className="px-4 pt-6 pb-4 flex-shrink-0">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-red-600 font-bold text-sm uppercase tracking-wide">Conquiste seu shape em 90 dias</span>
            <span className="text-gray-500 text-sm">{step + 1} / {TOTAL_STEPS}</span>
          </div>
          <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="bg-red-600 h-1.5 rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={{
                enter: (d: number) => ({ opacity: 0, y: d > 0 ? 24 : -24 }),
                center: { opacity: 1, y: 0 },
                exit: (d: number) => ({ opacity: 0, y: d > 0 ? -24 : 24 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="mb-8 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 leading-tight">
                  {currentStep.question}
                </h2>
                <p className="text-gray-400 text-sm">{currentStep.sub}</p>
              </div>

              {currentStep.type === "cards" && currentStep.options && (
                <div className={`grid gap-3 ${
                  isDaysStep ? "grid-cols-3" : isTwoColStep ? "grid-cols-2" : "grid-cols-1"
                }`}>
                  {currentStep.options.map((opt) => {
                    const selected = answers[currentStep.key] === opt.value;
                    const isCompact = isDaysStep || isTwoColStep;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleCardSelect(opt.value)}
                        className={`rounded-2xl border-2 transition-all duration-200 ${
                          isCompact ? "p-4 text-center flex flex-col items-center" : "p-4 text-left"
                        } ${
                          selected
                            ? "border-red-600 bg-red-600/10"
                            : "border-zinc-700 bg-zinc-900 hover:border-zinc-500 active:border-red-600/60"
                        }`}
                      >
                        {isDaysStep ? (
                          <>
                            <span className="text-3xl font-bold text-white mb-1">{opt.emoji}</span>
                            <span className={`text-xs font-medium ${selected ? "text-red-400" : "text-gray-400"}`}>
                              dias/sem
                            </span>
                          </>
                        ) : isTwoColStep ? (
                          <>
                            <div className="text-3xl mb-2">{opt.emoji}</div>
                            <div className={`font-bold text-sm ${selected ? "text-red-400" : "text-white"}`}>
                              {opt.label}
                            </div>
                            {opt.desc && (
                              <div className="text-gray-500 text-xs mt-1">{opt.desc}</div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="text-2xl mb-1">{opt.emoji}</div>
                            <div className="text-white font-semibold text-sm">{opt.label}</div>
                            {opt.desc && (
                              <div className="text-gray-500 text-xs mt-0.5">{opt.desc}</div>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {isInputStep && (
                <div className="space-y-4">
                  {currentStep.type === "textarea" ? (
                    <textarea
                      autoFocus
                      rows={3}
                      placeholder={currentStep.placeholder}
                      value={inputValue}
                      onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                      className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-red-600 outline-none rounded-2xl px-5 py-4 text-white text-base placeholder:text-zinc-600 transition resize-none"
                    />
                  ) : (
                    <input
                      autoFocus
                      type="text"
                      inputMode={currentStep.inputMode}
                      placeholder={currentStep.placeholder}
                      value={inputValue}
                      onChange={(e) => { setInputValue(e.target.value); setInputError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") handleInputContinue(); }}
                      className="w-full bg-zinc-900 border-2 border-zinc-700 focus:border-red-600 outline-none rounded-2xl px-5 py-5 text-white text-2xl text-center placeholder:text-zinc-600 transition"
                    />
                  )}
                  {inputError && (
                    <p className="text-red-400 text-sm text-center">{inputError}</p>
                  )}
                  <button
                    onClick={handleInputContinue}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-lg transition flex items-center justify-center gap-2"
                  >
                    {step === STEPS.length - 1 ? "Ver meu plano" : "Continuar"}
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  {currentStep.optional && (
                    <button
                      onClick={handleSkip}
                      className="w-full text-gray-500 hover:text-gray-300 text-sm py-2 transition"
                    >
                      Pular — não tenho limitações
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {step > 0 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={goBack}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-300 text-sm transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultScreen({ answers }: { answers: QuizAnswers }) {
  const insights = getInsights(answers);

  const chips = [
    { label: LABEL_MAP.objetivo[answers.objetivo] ?? answers.objetivo, red: true },
    { label: LABEL_MAP.nivel[answers.nivel] ?? answers.nivel, red: false },
    { label: LABEL_MAP.local[answers.local] ?? answers.local, red: false },
    { label: `${answers.dias}x por semana`, red: false },
    { label: LABEL_MAP.duracao[answers.duracao] ?? answers.duracao, red: false },
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-5xl mb-4">🎯</div>
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Seu plano está pronto!
          </h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">
            Com base no seu perfil, montamos uma estratégia de 90 dias personalizada para você.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-2 justify-center mb-6"
        >
          {chips.map((chip) => (
            <span
              key={chip.label}
              className={`border rounded-full px-3 py-1 text-sm font-medium ${
                chip.red
                  ? "bg-red-600/20 text-red-400 border-red-600/30"
                  : "bg-zinc-800 text-gray-300 border-zinc-700"
              }`}
            >
              {chip.label}
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6 space-y-4"
        >
          {[
            { icon: "🎯", text: insights.objetivo },
            { icon: "📈", text: insights.nivel },
            { icon: "📅", text: insights.dias },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-xl flex-shrink-0 leading-snug">{item.icon}</span>
              <p className="text-gray-300 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="space-y-3"
        >
          <a
            href={CHECKOUT_URL}
            className="block w-full bg-red-600 hover:bg-red-700 text-white font-bold py-5 rounded-2xl text-lg text-center transition shadow-lg shadow-red-900/20"
          >
            DESBLOQUEAR MEU PLANO — R$14,90
          </a>
          <p className="text-center text-gray-600 text-xs">
            Acesso imediato &nbsp;|&nbsp; Pagamento seguro &nbsp;|&nbsp; 7 dias de garantia
          </p>
        </motion.div>
      </div>
    </div>
  );
}
