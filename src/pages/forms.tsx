import { useState } from "react";

export default function Formulario() {
  const [form, setForm] = useState({
    idade: "",
    peso: "",
    altura: "",
    dias: "",
    objetivo: "",
    nivel: "",
  });

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const gerarTreino = () => {
    if (form.objetivo === "hipertrofia") {
      return "Treino A/B focado em ganho de massa com progressão de carga.";
    }

    if (form.objetivo === "definicao") {
      return "Treino metabólico com foco em queima de gordura e alta intensidade.";
    }

    if (form.objetivo === "recomposicao") {
      return "Treino estratégico equilibrando força e condicionamento.";
    }

    return "Plano personalizado básico.";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    setTimeout(() => {
      const treinoGerado = gerarTreino();
      setResultado(treinoGerado);
      setLoading(false);
    }, 2000); // 2 segundos de análise
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-red-600/30">
        {!resultado && (
          <>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Gerar Meu Plano Personalizado
            </h1>

            <p className="text-gray-400 text-center mb-6">
              Responda abaixo para receber seu treino estratégico de 90 dias
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                name="idade"
                placeholder="Idade"
                required
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600"
              />

              <input
                name="peso"
                placeholder="Peso (kg)"
                required
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600"
              />

              <input
                name="altura"
                placeholder="Altura (cm)"
                required
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600"
              />

              <input
                name="dias"
                placeholder="Dias por semana"
                required
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600"
              />

              <select
                name="objetivo"
                required
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600"
              >
                <option value="">Objetivo</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="definicao">Definição</option>
                <option value="recomposicao">Recomposição</option>
              </select>

              <select
                name="nivel"
                required
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600"
              >
                <option value="">Nível</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>

              <button
                type="submit"
                className="mt-4 bg-red-600 hover:bg-red-700 transition p-4 rounded-lg font-bold text-white text-lg shadow-lg"
              >
                GERAR MEU TREINO
              </button>
            </form>
          </>
        )}

        {loading && (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 border-solid mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-white">
              Analisando seu perfil...
            </h2>
            <p className="text-gray-400 mt-2">
              Criando sua estratégia personalizada
            </p>
          </div>
        )}

        {resultado && !loading && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Seu Plano Está Pronto 💪
            </h2>

            <p className="text-gray-300 mb-6">{resultado}</p>

            <div className="bg-black p-4 rounded-lg border border-red-600/30 text-sm text-gray-400">
              Recomendamos seguir o plano por 30 dias antes de qualquer ajuste.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}