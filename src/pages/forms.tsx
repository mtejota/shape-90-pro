import { useState, useEffect } from "react";

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
  const [progresso, setProgresso] = useState(0);
  const [mensagem, setMensagem] = useState("Iniciando análise...");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (!loading) return;

    setProgresso(0);
    setMensagem("Iniciando análise...");

    const etapas = [
      { limite: 15, intervalo: 300, msg: "Iniciando análise..." },
      { limite: 35, intervalo: 400, msg: "Lendo seus dados pessoais..." },
      { limite: 55, intervalo: 350, msg: "Processando seus dados..." },
      { limite: 75, intervalo: 450, msg: "Cruzando informações..." },
      { limite: 90, intervalo: 500, msg: "Montando seu plano estratégico..." },
      { limite: 99, intervalo: 600, msg: "Finalizando estratégia..." },
    ];

    let etapaAtual = 0;
    let progressoAtual = 0;
    let timer: ReturnType<typeof setTimeout>;
    let parado = false;

    const avancar = () => {
      if (parado) return;
      const etapa = etapas[etapaAtual];
      progressoAtual += 1;
      setProgresso(progressoAtual);
      setMensagem(etapa.msg);

      if (progressoAtual >= etapa.limite) {
        if (etapaAtual < etapas.length - 1) etapaAtual++;
      }

      // Para em 99 e aguarda a API responder
      if (progressoAtual < 99) {
        timer = setTimeout(avancar, etapas[etapaAtual].intervalo);
      }
    };

    timer = setTimeout(avancar, etapas[0].intervalo);

    return () => {
      parado = true;
      clearTimeout(timer);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    try {
      const res = await fetch("/api/gerar-treino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      setProgresso(100);
      setMensagem("Plano gerado com sucesso!");

      setTimeout(() => {
        setResultado(data.resultado);
        setLoading(false);
      }, 600);
    } catch (err) {
      setLoading(false);
      alert("Erro ao gerar o treino. Tente novamente.");
    }
  };

  const formatarResultado = (texto: string) => {
    return texto.split("\n").map((linha, i) => {
      if (linha.startsWith("### ")) {
        return (
          <h3 key={i} className="text-red-500 font-bold text-lg mt-6 mb-2">
            {linha.replace("### ", "")}
          </h3>
        );
      }
      if (linha.startsWith("- ")) {
        return (
          <li key={i} className="text-gray-300 ml-4 list-disc">
            {linha.replace("- ", "")}
          </li>
        );
      }
      if (linha.startsWith("**") && linha.endsWith("**")) {
        return (
          <p key={i} className="text-white font-semibold mt-2">
            {linha.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (linha.trim() === "") return <br key={i} />;
      return (
        <p key={i} className="text-gray-300 leading-relaxed">
          {linha}
        </p>
      );
    });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-xl bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-red-600/30">

        {!resultado && !loading && (
          <>
            <h1 className="text-3xl font-bold text-white text-center mb-2">
              Gerar Meu Plano Personalizado
            </h1>
            <p className="text-gray-400 text-center mb-6">
              Responda abaixo para receber seu treino estratégico de 90 dias
            </p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input name="idade" placeholder="Idade" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600" />

              <input name="peso" placeholder="Peso (kg)" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600" />

              <input name="altura" placeholder="Altura (cm)" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600" />

              <select name="dias" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600">
                <option value="">Dias por semana</option>
                <option value="2">2 dias</option>
                <option value="3">3 dias</option>
                <option value="4">4 dias</option>
                <option value="5">5 dias</option>
                <option value="6">6 dias</option>
                <option value="7">7 dias</option>
              </select>

              <select name="objetivo" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600">
                <option value="">Objetivo</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="definicao">Definição</option>
                <option value="recomposicao">Recomposição</option>
              </select>

              <select name="nivel" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600">
                <option value="">Nível</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>

              <button type="submit"
                className="mt-4 bg-red-600 hover:bg-red-700 transition p-4 rounded-lg font-bold text-white text-lg shadow-lg">
                GERAR MEU TREINO
              </button>
            </form>
          </>
        )}

        {loading && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-white mb-4">{mensagem}</h2>
            <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
              <div
                className="bg-red-600 h-4 transition-all duration-500"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="text-gray-400 mt-3">{progresso}%</p>
          </div>
        )}

        {resultado && !loading && (
          <div>
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Seu Plano Está Pronto 💪
            </h2>

            <div className="text-left space-y-1 max-h-[60vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-zinc-800">
              {formatarResultado(resultado)}
            </div>

            <div className="mt-8 text-center">
              
               <a href="https://pay.kiwify.com.br/RSdvsfe"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block w-full bg-red-600 hover:bg-red-700 transition p-4 rounded-lg font-bold text-white text-lg shadow-lg"
              >
                QUERO MEU PLANO COMPLETO — R$27
              </a>
              <p className="text-gray-500 text-sm mt-3">
                Acesso imediato após o pagamento
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}