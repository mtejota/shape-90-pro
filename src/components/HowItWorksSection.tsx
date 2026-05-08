import AnimatedSection from "@/components/AnimatedSection";

const steps = [
  { num: "01", title: "Realize a compra", desc: "Acesso imediato e seguro." },
  { num: "02", title: "Responda o formulário", desc: "Perguntas simples sobre seu perfil e rotina." },
  { num: "03", title: "Receba seu plano", desc: "Personalizado e pronto para seguir." },
];

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <AnimatedSection variant="down">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase text-center mb-14">
            Como <span className="text-gradient-red">funciona</span>
          </h2>
        </AnimatedSection>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <AnimatedSection key={s.num} delay={i * 0.2} variant="zoom">
              <div className="text-center space-y-4 group">
                <span className="inline-block font-heading text-5xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                  {s.num}
                </span>
                <h3 className="font-heading text-xl font-semibold uppercase">
                  {s.title}
                </h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
