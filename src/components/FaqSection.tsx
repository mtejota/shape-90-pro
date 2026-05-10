import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import AnimatedSection from "@/components/AnimatedSection";

const faqs = [
  {
    q: "O treino é realmente personalizado?",
    a: "Sim. Após a compra, você responde um formulário com informações sobre seu objetivo, nível, rotina e realidade. Com base nisso, seu plano é montado de forma personalizada.",
  },
  {
    q: "Funciona para quem quer emagrecer?",
    a: "Sim. O plano pode ser direcionado para perda de gordura, definição, ganho de massa ou retomada de rotina, de acordo com o seu objetivo.",
  },
  {
    q: "Funciona para mulheres?",
    a: "Sim. O Shape 90D é feito com base no objetivo e rotina de cada pessoa, independente do gênero.",
  },
  {
    q: "Funciona para iniciantes?",
    a: "Sim. O plano pode ser adaptado para quem está começando, voltando a treinar ou ainda não sabe qual treino seguir.",
  },
  {
    q: "Como recebo meu plano depois da compra?",
    a: "Após a compra, você será direcionado para responder o formulário. Depois disso, seu plano será preparado com base nas suas respostas.",
  },
  {
    q: "Preciso de academia?",
    a: "Depende da sua realidade. No formulário você informa onde pretende treinar, e o plano será pensado com base nas informações enviadas.",
  },
  {
    q: "Preciso de suplementação?",
    a: "Não é obrigatório. O plano inclui orientações básicas alinhadas ao seu objetivo. Suplementos podem ajudar, mas não são essenciais.",
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
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase leading-[1.12] text-center mb-12">
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
