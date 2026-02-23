import { Quote } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const quotes = [
  "Treinar sem estratégia é o motivo pelo qual você não evolui.",
  "Resultado vem de consistência e planejamento.",
  "Quem treina com método, constrói um shape de verdade.",
];

const AuthoritySection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto space-y-8">
          {quotes.map((q, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="flex gap-4 items-start p-6 rounded-lg border border-primary/20 bg-primary/5 hover:border-primary/40 transition-colors duration-300">
                <Quote className="w-8 h-8 text-primary shrink-0 mt-1" />
                <p className="font-heading text-xl md:text-2xl font-semibold uppercase leading-tight">
                  {q}
                </p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AuthoritySection;
