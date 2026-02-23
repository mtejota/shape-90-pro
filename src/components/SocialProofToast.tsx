import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";

const names = [
  "Lucas M.", "Gabriel S.", "Pedro H.", "João V.", "Rafael C.",
  "Matheus L.", "Gustavo R.", "Felipe A.", "Bruno T.", "Caio D.",
  "André P.", "Thiago F.", "Vinícius B.", "Eduardo N.", "Leonardo K.",
];

const cities = [
  "São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba",
  "Porto Alegre", "Brasília", "Salvador", "Recife", "Fortaleza",
];

const SocialProofToast = () => {
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState({ name: "", city: "", time: "" });

  useEffect(() => {
    const getRandomTime = () => `${Math.floor(Math.random() * 58) + 2} min atrás`;

    const show = () => {
      setCurrent({
        name: names[Math.floor(Math.random() * names.length)],
        city: cities[Math.floor(Math.random() * cities.length)],
        time: getRandomTime(),
      });
      setVisible(true);
      setTimeout(() => setVisible(false), 4000);
    };

    const initialDelay = setTimeout(show, 8000);
    const interval = setInterval(show, 18000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          className="fixed bottom-24 md:bottom-6 left-4 z-50 bg-card border border-primary/30 rounded-lg p-4 shadow-lg max-w-xs"
        >
          <div className="flex items-center gap-3">
            <div className="bg-primary/20 rounded-full p-2">
              <ShoppingCart className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold">
                {current.name} <span className="text-muted-foreground font-normal">de {current.city}</span>
              </p>
              <p className="text-xs text-muted-foreground">
                Comprou o Projeto Shape 90D · {current.time}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SocialProofToast;
