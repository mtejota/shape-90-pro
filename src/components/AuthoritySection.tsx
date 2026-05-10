import { Quote } from "lucide-react";
import AnimatedSection from "@/components/AnimatedSection";

const quotes = [
  "O problema não é falta de força de vontade. É falta de um plano claro para seguir.",
  "Resultado vem de constância, direção e planejamento.",
  "Quem treina com método para de depender de motivação.",
];

const AuthoritySection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="max-w-3xl mx-auto space-y-8">
          {quotes.map((q, i) => (
            <AnimatedSection key={i} delay={i * 0.15} variant={i % 2 === 0 ? "left" : "right"}>
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
