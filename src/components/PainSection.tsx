import { XCircle } from "lucide-react";
import AnimatedSection, { StaggerItem } from "@/components/AnimatedSection";

const pains = [
  "Começa a treinar e para depois de poucos dias",
  "Não sabe qual treino seguir",
  "Treina sem saber se está fazendo certo",
  "Quer ganhar massa, perder gordura ou definir, mas não tem direção",
  "Vive salvando treino da internet e nunca segue um plano de verdade",
];

const PainSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <AnimatedSection variant="blur">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase leading-[1.12] text-center mb-12">
            Se você se identifica com isso,{" "}
            <span className="block mt-2 text-gradient-red">o Shape 90D foi feito para você:</span>
          </h2>
        </AnimatedSection>
        <div className="max-w-2xl mx-auto space-y-5">
          {pains.map((pain, i) => (
            <StaggerItem key={i} delay={i * 0.12} variant={i % 2 === 0 ? "left" : "right"}>
              <div className="flex items-center gap-4 bg-card rounded-lg p-5 border border-border hover:border-primary/40 hover:translate-x-1 transition-all duration-300">
                <XCircle className="w-6 h-6 text-primary shrink-0" />
                <span className="text-lg font-medium">{pain}</span>
              </div>
            </StaggerItem>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PainSection;
