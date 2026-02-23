import heroImg from "@/assets/hero-gym.jpg";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  const scrollToCta = () => {
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Jovem treinando pesado na academia"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-2xl space-y-6">
          <span className="inline-block font-heading text-sm uppercase tracking-[0.3em] text-primary">
            Projeto Shape 90D
          </span>
          <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.95]">
            Magro e cansado de{" "}
            <span className="text-gradient-red">não ganhar massa?</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg">
            Receba um plano de treino personalizado para os próximos 90 dias e
            comece a transformar seu shape de forma estratégica.
          </p>
          <Button variant="cta" size="xl" onClick={scrollToCta}>
            QUERO MEU SHAPE AGORA
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
