import { CheckCircle } from "lucide-react";

const benefits = [
  "Divisão semanal estratégica",
  "Exercícios organizados",
  "Séries e repetições definidas",
  "Estratégia de progressão",
  "Guia básico para alimentação focada em ganho de massa",
  "Estrutura pensada para 90 dias",
];

const SolutionSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase text-center mb-6">
          O Projeto Shape 90D foi criado para{" "}
          <span className="text-gradient-red">resolver exatamente isso.</span>
        </h2>
        <p className="text-muted-foreground text-center text-lg max-w-2xl mx-auto mb-14">
          Você responde algumas perguntas simples e recebe um plano de treino
          personalizado baseado nos seus dados físicos e rotina.
        </p>
        <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
          {benefits.map((b, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-card rounded-lg p-5 border border-border"
            >
              <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              <span className="font-medium">{b}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionSection;
