import { XCircle } from "lucide-react";
import AnimatedSection, { StaggerItem } from "@/components/AnimatedSection";

const pains = [
  "Treina e não cresce",
  "Não sabe qual treino seguir",
  "Vive copiando treino aleatório da internet",
  "Não vê resultado no espelho",
  "Se sente pequeno perto dos outros",
];

const PainSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <AnimatedSection>
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase text-center mb-12">
            Se você se identifica com isso,{" "}
            <span className="text-gradient-red">essa página é pra você:</span>
          </h2>
        </AnimatedSection>
        <div className="max-w-2xl mx-auto space-y-5">
          {pains.map((pain, i) => (
            <StaggerItem key={i} delay={i * 0.12}>
              <div className="flex items-center gap-4 bg-card rounded-lg p-5 border border-border hover:border-primary/40 transition-colors duration-300">
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
