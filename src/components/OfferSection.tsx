import { Button } from "@/components/ui/button";
import { Shield, Zap, Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import AnimatedSection from "@/components/AnimatedSection";

const CountdownTimer = () => {
  const [time, setTime] = useState({ h: 2, m: 47, s: 33 });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) { h = 23; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="flex items-center justify-center gap-2">
      <Clock className="w-4 h-4 text-primary" />
      <span className="text-sm text-muted-foreground">Oferta expira em</span>
      <div className="flex gap-1 font-heading font-bold text-primary">
        <span className="bg-primary/10 px-2 py-1 rounded">{pad(time.h)}</span>:
        <span className="bg-primary/10 px-2 py-1 rounded">{pad(time.m)}</span>:
        <span className="bg-primary/10 px-2 py-1 rounded">{pad(time.s)}</span>
      </div>
    </div>
  );
};

const OfferSection = () => {
  const navigate = useNavigate();
  return (
    <section id="oferta" className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <AnimatedSection>
            <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase leading-[1.12]">
              Comece seu{" "}
              <span className="text-gradient-red">plano de 90 dias hoje.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="bg-card border border-primary/30 rounded-2xl p-8 md:p-12 space-y-6 glow-red">
              <CountdownTimer />
              <p className="text-muted-foreground text-sm uppercase tracking-widest">
                Por apenas
              </p>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-muted-foreground line-through text-lg mr-2">R$97</span>
                <span className="text-muted-foreground text-2xl font-heading">R$</span>
                <motion.span
                  className="font-heading text-7xl md:text-8xl font-bold text-primary"
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", stiffness: 200 }}
                >
                  14,90
                </motion.span>
              </div>
              <p className="text-muted-foreground">
                Plano de treino personalizado para seu objetivo, nível e rotina
              </p>
              <div className="text-left">
                <p className="text-sm font-semibold uppercase tracking-wide mb-2">
                  Você vai receber:
                </p>
                <p className="text-sm text-muted-foreground">Plano de treino personalizado para 90 dias</p>
                <p className="text-sm text-muted-foreground">Divisão semanal de treino</p>
                <p className="text-sm text-muted-foreground">Exercícios organizados por objetivo</p>
                <p className="text-sm text-muted-foreground">Séries e repetições definidas</p>
                <p className="text-sm text-muted-foreground">Estratégia de progressão</p>
                <p className="text-sm text-muted-foreground">Orientações básicas para melhorar seus resultados</p>
                <p className="text-sm text-muted-foreground">Plano gerado com base no seu perfil completo</p>
              </div>

              <Button variant="cta" size="xl" className="w-full" onClick={() => navigate("/quiz")}>
                FAZER O QUIZ E COMEÇAR
              </Button>
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-primary" />
                  Acesso imediato após o pagamento
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  37 pessoas visualizando agora
                </div>
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.4}>
            <div className="bg-card border border-border rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                <h3 className="font-heading text-lg font-semibold uppercase">
                  Risco zero para você
                </h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Você tem 7 dias de garantia. Se achar que o plano não é para
                você, pode solicitar o reembolso dentro desse prazo.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
