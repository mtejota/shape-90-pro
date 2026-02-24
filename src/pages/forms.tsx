import { useState, useEffect } from "react";
import { gerarPDF } from "@/lib/gerarPDF";

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
  const [gerandoPDF, setGerandoPDF] = useState(false);

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

  const baixarPDF = async () => {
    if (!resultado) return;
    setGerandoPDF(true);
    try {
      await gerarPDF(resultado, form);
    } catch {
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setGerandoPDF(false);
    }
  };

  const formatarResultado = (texto: string) => {
    const linhas = texto.split("\n");
    const elementos: JSX.Element[] = [];
    let i = 0;

    while (i < linhas.length) {
      const linha = linhas[i].trim();

      if (linha.startsWith("# ") || linha.startsWith("## ")) {
        elementos.push(
          <h1 key={i} className="text-xl md:text-2xl font-bold text-white text-center mb-4 mt-2 border-b border-red-600/40 pb-3">
            {linha.replace(/^#{1,2} /, "")}
          </h1>
        );
      } else if (linha.startsWith("### ") || linha.startsWith("#### ")) {
        elementos.push(
          <div key={i} className="mt-6 mb-2">
            <h2 className="text-red-500 font-bold text-base uppercase tracking-wide flex items-center gap-2">
              <span className="inline-block w-1 h-4 bg-red-600 rounded" />
              {linha.replace(/^#{3,4} /, "")}
            </h2>
          </div>
        );
      } else if (linha.startsWith("**") && linha.endsWith("**")) {
        const nome = linha.replace(/\*\*/g, "");
        const props: { label: string; valor: string }[] = [];
        let j = i + 1;
        while (j < linhas.length) {
          const sub = linhas[j].trim();
          if (sub.startsWith("- Séries:") || sub.startsWith("- Repetições:") ||
            sub.startsWith("- Descanso:") || sub.startsWith("- Tempo:")) {
            const [label, ...resto] = sub.replace("- ", "").split(":");
            props.push({ label: label.trim(), valor: resto.join(":").trim() });
            j++;
          } else break;
        }

        elementos.push(
          <div key={i} className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 mb-3">
            <p className="text-white font-semibold mb-3">{nome}</p>
            <div className="flex flex-wrap gap-2">
              {props.map((p, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-center min-w-[85px]">
                  <p className="text-gray-500 text-xs uppercase tracking-wide">{p.label}</p>
                  <p className="text-red-400 font-bold text-sm mt-1">{p.valor}</p>
                </div>
              ))}
            </div>
          </div>
        );

        i = j;
        continue;
      } else if (linha.startsWith("- ") && !linha.match(/^- (Séries|Repetições|Descanso|Tempo):/)) {
        elementos.push(
          <li key={i} className="text-gray-300 ml-4 list-disc leading-relaxed text-sm">
            {linha.replace(/^- /, "").replace(/\*\*/g, "")}
          </li>
        );
      } else if (linha === "---") {
        elementos.push(<hr key={i} className="border-zinc-700 my-4" />);
      } else if (linha === "") {
        elementos.push(<div key={i} className="h-2" />);
      } else {
        const ehSecao = /^\d+\.\s/.test(linha.replace(/\*\*/g, ""));
        elementos.push(
          <p key={i} className={`leading-relaxed text-sm ${ehSecao ? "text-red-400 font-bold mt-4" : "text-gray-300"}`}>
            {linha.replace(/\*\*/g, "")}
          </p>
        );
      }

      i++;
    }

    return elementos;
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div className="relative w-full max-w-2xl bg-zinc-900 p-8 rounded-2xl shadow-2xl border border-red-600/30">

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
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none" />
              <input name="peso" placeholder="Peso (kg)" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none" />
              <input name="altura" placeholder="Altura (cm)" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none" />

              <select name="dias" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none">
                <option value="">Dias por semana</option>
                <option value="2">2 dias</option>
                <option value="3">3 dias</option>
                <option value="4">4 dias</option>
                <option value="5">5 dias</option>
                <option value="6">6 dias</option>
                <option value="7">7 dias</option>
              </select>

              <select name="objetivo" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none">
                <option value="">Objetivo</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="definicao">Definição</option>
                <option value="recomposicao">Emagrecimento</option>
              </select>

              <select name="nivel" required onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none">
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
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-4">{mensagem}</h2>
            <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
              <div className="bg-red-600 h-4 transition-all duration-500 rounded-full"
                style={{ width: `${progresso}%` }} />
            </div>
            <p className="text-gray-400 mt-3 text-sm">{progresso}%</p>
          </div>
        )}

        {resultado && !loading && (
          <div>
            {/* Header */}
            <div className="text-center mb-6">
              <span className="text-4xl">💪</span>
              <h2 className="text-2xl font-bold text-white mt-2">Seu Plano Está Pronto!</h2>
              <p className="text-gray-400 text-sm mt-1">Role para baixo para ver o plano completo</p>
            </div>

            {/* Preview do conteúdo */}
            <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-5 max-h-[50vh] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-zinc-800">
              {formatarResultado(resultado)}
            </div>

            {/* Botão Download PDF */}
            <div className="mt-6 space-y-3">
              <button
                onClick={baixarPDF}
                disabled={gerandoPDF}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition p-4 rounded-xl font-bold text-white text-lg shadow-lg flex items-center justify-center gap-3"
              >
                {gerandoPDF ? (
                  <>
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Gerando seu PDF...
                  </>
                ) : (
                  <>
                    📄 Baixar Plano em PDF
                  </>
                )}
              </button>

              <p className="text-center text-gray-500 text-xs">
                ✅ PDF gerado localmente &nbsp;|&nbsp; 🔒 Seus dados são privados
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}