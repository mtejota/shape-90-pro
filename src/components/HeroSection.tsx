import heroImg from "@/assets/hero-gym.jpg";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const HeroSection = () => {
  const scrollToCta = () => {
    document.getElementById("oferta")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0">
        <motion.img
          src={heroImg}
          alt="Jovem treinando pesado na academia"
          className="w-full h-full object-cover"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50" />
      </div>

      <div className="container relative z-10 py-20 md:py-32">
        <div className="max-w-2xl space-y-6">
          <motion.span
            className="inline-block font-heading text-sm uppercase tracking-[0.3em] text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Projeto Shape 90D
          </motion.span>
          <motion.h1
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[0.95]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Magro e cansado de{" "}
            <span className="text-gradient-red">não ganhar massa?</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Receba um plano de treino personalizado para os próximos 90 dias e
            comece a transformar seu shape de forma estratégica.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
          >
            <Button variant="cta" size="xl" onClick={scrollToCta}>
              QUERO MEU SHAPE AGORA
            </Button>
          </motion.div>
          <motion.p
            className="text-xs text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            +230 alunos já transformaram o shape
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
