import heroImg from "@/assets/hero-gym.jpg";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const navigate = useNavigate();
  const scrollToCta = () => navigate("/quiz");

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
            className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold uppercase leading-[1.08]"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Pare de treinar no achismo.{" "}
            <span className="text-gradient-red">Transforme seu corpo em 90 dias.</span>
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            Responda 8 perguntas sobre seu corpo e rotina. Receba um plano de treino
            de 90 dias feito exatamente para você — na hora.
          </motion.p>
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1, type: "spring" }}
          >
            <Button variant="cta" size="xl" onClick={scrollToCta}>
              FAZER O QUIZ GRÁTIS
            </Button>
            <p className="text-xs text-muted-foreground">
              8 perguntas · 2 minutos · sem cadastro
            </p>
          </motion.div>
          <motion.p
            className="text-xs text-muted-foreground flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            +230 alunos já descobriram seu plano ideal
          </motion.p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
