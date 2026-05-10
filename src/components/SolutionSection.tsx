import { CheckCircle } from "lucide-react";
import AnimatedSection, { StaggerItem } from "@/components/AnimatedSection";

const benefits = [
  "Divisão semanal estratégica",
  "Exercícios organizados por objetivo",
  "Séries e repetições definidas",
  "Estratégia de progressão",
  "Orientações básicas alinhadas ao seu objetivo",
  "Estrutura pensada para 90 dias",
];

const SolutionSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <AnimatedSection variant="zoom">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase leading-[1.12] text-center mb-6">
            O Projeto Shape 90D foi criado para{" "}
            <span className="text-gradient-red">te dar clareza, direção e um plano real.</span>
          </h2>
          <p className="text-muted-foreground text-center text-lg max-w-2xl mx-auto mb-14">
            Você responde algumas perguntas sobre seu corpo, objetivo e rotina.
            A partir disso, recebe um treino organizado para seguir pelos
            próximos 90 dias.
          </p>
        </AnimatedSection>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {benefits.map((b, i) => (
            <StaggerItem key={i} delay={i * 0.1}>
              <div className="flex items-center gap-3 bg-card rounded-lg p-5 border border-border hover:border-primary/40 hover:glow-red transition-all duration-300">
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
                <span className="font-medium">{b}</span>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
