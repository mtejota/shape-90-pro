import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import AnimatedSection from "@/components/AnimatedSection";

const QUIZ_KEY = "shape90:quiz";

const OBJETIVO_OPTIONS = [
  { value: "hipertrofia", label: "Ganhar Massa", emoji: "💪", desc: "Aumentar volume muscular" },
  { value: "definicao", label: "Definição", emoji: "✂️", desc: "Secar mantendo músculo" },
  { value: "emagrecimento", label: "Emagrecimento", emoji: "🔥", desc: "Perder peso com saúde" },
];

export default function QuizPreviewSection() {
  const navigate = useNavigate();

  const startWithObjetivo = (value: string) => {
    const partial = {
      objetivo: value,
      nivel: "", local: "", dias: "",
      idade: "", peso: "", altura: "", limitacoes: "",
    };
    localStorage.setItem(QUIZ_KEY, JSON.stringify(partial));
    navigate("/quiz");
  };

  return (
    <section className="py-20 md:py-28 bg-black">
      <div className="container">
        <div className="max-w-lg mx-auto">
          <AnimatedSection className="text-center mb-10">
            <span className="inline-block text-xs font-bold uppercase tracking-widest text-red-500 border border-red-600/30 rounded-full px-3 py-1 mb-4">
              Quiz Rápido
            </span>
            <h2 className="font-heading text-3xl md:text-4xl font-bold uppercase leading-tight text-white mb-3">
              Responda uma pergunta<br />
              <span className="text-red-500">e descubra seu plano:</span>
            </h2>
            <p className="text-gray-400 text-sm">
              8 perguntas no total · menos de 2 minutos
            </p>
          </AnimatedSection>

          <AnimatedSection delay={0.15}>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">
              <p className="text-white font-semibold mb-1 text-center">
                Qual é o seu objetivo principal?
              </p>
              <p className="text-gray-500 text-xs text-center mb-6">
                Selecione para começar agora
              </p>

              <div className="grid gap-3">
                {OBJETIVO_OPTIONS.map((opt, i) => (
                  <motion.button
                    key={opt.value}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }}
                    whileHover={{ scale: 1.02, borderColor: "rgb(220 38 38)" }}
                    onClick={() => startWithObjetivo(opt.value)}
                    className="w-full text-left p-4 rounded-xl border-2 border-zinc-700 bg-zinc-800/60 hover:bg-red-600/5 hover:border-red-600 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{opt.emoji}</span>
                      <div>
                        <p className="text-white font-semibold group-hover:text-red-400 transition-colors">
                          {opt.label}
                        </p>
                        <p className="text-gray-500 text-xs">{opt.desc}</p>
                      </div>
                      <span className="ml-auto text-gray-600 group-hover:text-red-500 transition-colors text-lg">
                        →
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>

              <p className="text-center text-gray-600 text-xs mt-5">
                Seu plano personalizado aparece ao final
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
