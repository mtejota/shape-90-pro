import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "@/components/AnimatedSection";

const faqs = [
  {
    q: "Funciona para iniciantes?",
    a: "Sim! O plano é personalizado com base no seu nível de experiência. Se você é iniciante, os exercícios e a progressão serão adaptados para você.",
  },
  {
    q: "Posso treinar em casa?",
    a: "O plano é focado em treinos na academia com equipamentos. Se você treina em casa com equipamentos básicos, informe no formulário e faremos o possível para adaptar.",
  },
  {
    q: "Preciso de suplementação?",
    a: "Não é obrigatório. O plano inclui um guia básico de alimentação focado em ganho de massa. Suplementos podem ajudar, mas não são essenciais.",
  },
  {
    q: "Em quanto tempo começo a ver resultado?",
    a: "Com consistência e alimentação adequada, a maioria das pessoas nota diferenças visíveis entre 4 a 6 semanas. O plano é estruturado para 90 dias de evolução contínua.",
  },
];

const FaqSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <AnimatedSection variant="blur">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase text-center mb-12">
            Perguntas <span className="text-gradient-red">frequentes</span>
          </h2>
        </AnimatedSection>
        <AnimatedSection delay={0.2}>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqs.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-card border border-border rounded-lg px-6 hover:border-primary/30 transition-colors duration-300"
                >
                  <AccordionTrigger className="font-heading text-base font-semibold uppercase hover:no-underline">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default FaqSection;
