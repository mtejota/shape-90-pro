import { Button } from "@/components/ui/button";
import { Shield, Zap } from "lucide-react";

const OfferSection = () => {
  return (
    <section id="oferta" className="py-20 md:py-28 bg-secondary/50">
      <div className="container">
        <div className="max-w-xl mx-auto text-center space-y-8">
          <h2 className="font-heading text-3xl md:text-5xl font-bold uppercase">
            Invista no seu{" "}
            <span className="text-gradient-red">shape hoje.</span>
          </h2>

          <div className="bg-card border border-primary/30 rounded-2xl p-8 md:p-12 space-y-6 glow-red">
            <p className="text-muted-foreground text-sm uppercase tracking-widest">
              Por apenas
            </p>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-muted-foreground text-2xl font-heading">R$</span>
              <span className="font-heading text-7xl md:text-8xl font-bold text-primary">
                27
              </span>
            </div>
            <p className="text-muted-foreground">
              Plano de treino personalizado de 90 dias
            </p>
            <Button variant="cta" size="xl" className="w-full">
              COMEÇAR MEU PROJETO AGORA
            </Button>
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Zap className="w-4 h-4 text-primary" />
              Acesso imediato após o pagamento
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-lg font-semibold uppercase">
                Risco zero para você
              </h3>
            </div>
            <p className="text-muted-foreground text-sm">
              Se em até 7 dias você achar que o produto não é para você, pode
              solicitar reembolso. Sem perguntas.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferSection;
