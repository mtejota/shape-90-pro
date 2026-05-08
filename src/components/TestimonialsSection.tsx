import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnimatedSection from "@/components/AnimatedSection";
import { motion } from "framer-motion";
import t1 from "@/assets/transformacao-1.jpg";
import t2 from "@/assets/transformacao-2.jpg";
import t3 from "@/assets/transformacao-3.jpg";
import t4 from "@/assets/transformacao-4.jpg";

const testimonials = [
  {
    image: t3,
    name: "Pedro H.",
    age: "21 anos",
    period: "90 dias",
    quote:
      "Sempre fui o magrelo do grupo. Em 3 meses ganhei 7kg de massa e finalmente tenho um shape que respeita.",
  },
  {
    image: t1,
    name: "Rafael C.",
    age: "24 anos",
    period: "90 dias",
    quote:
      "Achei que nunca ia conseguir. Segui o plano à risca e o resultado falou por si. Mudou minha cabeça.",
  },
  {
    image: t2,
    name: "Camila S.",
    age: "23 anos",
    period: "90 dias",
    quote:
      "Treinava sem direção e não via resultado. Com o método ficou claro o que fazer todo dia.",
  },
  {
    image: t4,
    name: "Juliana M.",
    age: "25 anos",
    period: "90 dias",
    quote:
      "Definição que eu queria há anos chegou em 3 meses seguindo o protocolo. Insano.",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="resultados" className="py-20 md:py-28 bg-background">
      <div className="container">
        <AnimatedSection className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-block text-primary font-heading uppercase tracking-widest text-sm mb-4">
            Resultados Reais
          </span>
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase mb-4">
            Transformações de quem{" "}
            <span className="text-gradient-red">parou de enrolar</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Pessoas comuns que aplicaram o método Shape 90D e viraram o jogo em apenas 3 meses.
          </p>
        </AnimatedSection>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <AnimatedSection key={i} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.3 }}
                className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col hover:border-primary/60 hover:glow-red transition-all"
              >
                <div className="relative">
                  <img
                    src={t.image}
                    alt={`Antes e depois de ${t.name} após o Projeto Shape 90D`}
                    className="w-full h-auto object-cover"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground font-heading uppercase text-xs font-bold px-3 py-1 rounded-full">
                    {t.period}
                  </div>
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-1 text-primary">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="w-4 h-4 fill-primary" />
                    ))}
                  </div>
                  <Quote className="w-6 h-6 text-primary/40" />
                  <p className="text-foreground/90 italic leading-relaxed">
                    "{t.quote}"
                  </p>
                  <div className="mt-auto pt-3 border-t border-border">
                    <p className="font-heading font-bold uppercase">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.age}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={0.3} className="text-center mt-14">
          <p className="text-muted-foreground mb-6 text-lg">
            O próximo antes e depois pode ser o <span className="text-primary font-bold">seu</span>.
          </p>
          <a href="#oferta">
            <Button variant="cta" size="xl">
              QUERO MINHA TRANSFORMAÇÃO
            </Button>
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default TestimonialsSection;
