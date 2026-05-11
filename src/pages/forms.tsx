import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { gerarPDF } from "@/lib/gerarPDF";

type StatusAcesso = "verificando" | "liberado" | "bloqueado";

type MotivosBloqueio = {
  [key: string]: { titulo: string; descricao: string };
};

const MENSAGENS_BLOQUEIO: MotivosBloqueio = {
  token_invalido: {
    titulo: "Link inválido",
    descricao:
      "Este link de acesso não existe ou foi digitado incorretamente. Verifique o email que recebeu após a compra.",
  },
  token_ja_usado: {
    titulo: "Link já utilizado",
    descricao:
      "Este link já foi usado para gerar um plano. Cada compra gera um link exclusivo de uso único.",
  },
  token_ausente: {
    titulo: "Acesso não autorizado",
    descricao:
      "Esta página só pode ser acessada através do link enviado após a compra.",
  },
  erro_servidor: {
    titulo: "Erro temporário",
    descricao:
      "Houve um problema ao verificar seu acesso. Aguarde alguns segundos e tente novamente.",
  },
};

const LAST_ORDER_CODE_KEY = "shape90:last_order_code";
const FORM_DRAFT_PREFIX = "shape90:form_draft:";

export default function Formulario() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const order_code = searchParams.get("order_code");

  const [statusAcesso, setStatusAcesso] = useState<StatusAcesso>("verificando");
  const [motivoBloqueio, setMotivoBloqueio] = useState<string>("token_ausente");

  useEffect(() => {
    if (!order_code) {
      const cachedOrderCode =
        typeof window !== "undefined"
          ? window.localStorage.getItem(LAST_ORDER_CODE_KEY)
          : null;

      if (cachedOrderCode) {
        navigate(`/formulario?order_code=${encodeURIComponent(cachedOrderCode)}`, {
          replace: true,
        });
        return;
      }

      navigate("/", { replace: true });
      return;
    }

    if (typeof window !== "undefined") {
      window.localStorage.setItem(LAST_ORDER_CODE_KEY, order_code);
    }

    async function verificarAcesso() {
      try {
        const res = await fetch(
          `/api/validar-token?order_code=${encodeURIComponent(order_code!)}`
        );
        const data = await res.json();

        if (data.valido) {
          setStatusAcesso("liberado");
        } else {
          if (typeof window !== "undefined") {
            window.localStorage.removeItem(LAST_ORDER_CODE_KEY);
          }
          setMotivoBloqueio(data.motivo || "token_invalido");
          setStatusAcesso("bloqueado");
        }
      } catch {
        setMotivoBloqueio("erro_servidor");
        setStatusAcesso("bloqueado");
      }
    }

    verificarAcesso();
  }, [order_code, navigate]);

  if (statusAcesso === "verificando") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-5" />
          <p className="text-white font-semibold text-lg mb-1">
            Verificando seu acesso...
          </p>
          <p className="text-gray-500 text-sm">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  if (statusAcesso === "bloqueado") {
    const msg =
      MENSAGENS_BLOQUEIO[motivoBloqueio] || MENSAGENS_BLOQUEIO.token_invalido;

    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-4">
        <div className="bg-zinc-900 border border-red-600/20 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h1 className="text-xl font-bold text-white mb-2">{msg.titulo}</h1>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            {msg.descricao}
          </p>
          <a
            href="/acesso"
            className="inline-block bg-red-600 hover:bg-red-700 transition text-white font-bold px-8 py-3 rounded-xl text-sm"
          >
            Tentar recuperar acesso
          </a>
          <p className="text-gray-600 text-xs mt-5">
            Problemas com o acesso? Contate o suporte respondendo o email de compra.
          </p>
        </div>
      </div>
    );
  }

  return <FormularioContent order_code={order_code!} />;
}

function FormularioContent({ order_code }: { order_code: string }) {
  const [form, setForm] = useState({
    idade: "",
    peso: "",
    altura: "",
    dias: "",
    objetivo: "",
    nivel: "",
    local: "",
    limitacoes: "",
  });

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<string | null>(null);
  const [progresso, setProgresso] = useState(0);
  const [mensagem, setMensagem] = useState("Iniciando análise...");
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const draftStorageKey = `${FORM_DRAFT_PREFIX}${order_code}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(draftStorageKey);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        setForm((prev) => ({ ...prev, ...parsed }));
      }
    } catch {
      window.localStorage.removeItem(draftStorageKey);
    }
  }, [draftStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(draftStorageKey, JSON.stringify(form));
  }, [form, draftStorageKey]);

  const sanitizeIntegerInput = (value: string) =>
    value.replace(/[^\d]/g, "");

  const sanitizeDecimalInput = (value: string) => {
    let normalized = value
      .replace(/\s/g, "")
      .replace(/[^\d.,]/g, "")
      .replace(",", ".");
    const firstDot = normalized.indexOf(".");
    if (firstDot !== -1) {
      normalized =
        normalized.slice(0, firstDot + 1) +
        normalized.slice(firstDot + 1).replace(/\./g, "");
    }
    return normalized;
  };

  const parseNumberLoose = (raw: string) => {
    const cleaned = sanitizeDecimalInput(raw);
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  };

  const normalizeHeightToCm = (raw: string) => {
    const n = parseNumberLoose(raw);
    if (n === null) return null;
    if (n > 0 && n < 3) return n * 100;
    return n;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    let nextValue = value;

    if (name === "idade" || name === "dias") {
      nextValue = sanitizeIntegerInput(value);
    } else if (name === "peso" || name === "altura") {
      nextValue = sanitizeDecimalInput(value);
    }

    setForm({ ...form, [name]: nextValue });
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const copy = { ...prev };
      delete copy[name];
      return copy;
    });
  };

  const validateAndNormalizeForm = () => {
    const errors: Record<string, string> = {};

    const idade = Number(form.idade);
    if (!Number.isInteger(idade) || idade < 14 || idade > 100) {
      errors.idade = "Informe uma idade válida entre 14 e 100.";
    }

    const peso = parseNumberLoose(form.peso);
    if (peso === null || peso < 30 || peso > 300) {
      errors.peso = "Informe um peso válido entre 30 e 300 kg.";
    }

    const altura = normalizeHeightToCm(form.altura);
    if (altura === null || altura < 100 || altura > 250) {
      errors.altura =
        "Informe altura válida (ex: 160, 1,60 ou 1.60).";
    }

    const dias = Number(form.dias);
    if (!Number.isInteger(dias) || dias < 2 || dias > 7) {
      errors.dias = "Selecione entre 2 e 7 dias por semana.";
    }

    if (!form.objetivo) errors.objetivo = "Selecione seu objetivo.";
    if (!form.nivel) errors.nivel = "Selecione seu nível.";
    if (!form.local) errors.local = "Selecione onde vai treinar.";
    if (form.limitacoes.length > 500) {
      errors.limitacoes = "Limitações deve ter no máximo 500 caracteres.";
    }

    const normalizedPayload = {
      ...form,
      idade,
      peso: peso ?? form.peso,
      altura: altura ?? form.altura,
      dias,
      limitacoes: form.limitacoes.trim(),
      order_code,
    };

    return { errors, normalizedPayload };
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
      if (progressoAtual >= etapa.limite && etapaAtual < etapas.length - 1)
        etapaAtual++;
      if (progressoAtual < 99)
        timer = setTimeout(avancar, etapas[etapaAtual].intervalo);
    };

    timer = setTimeout(avancar, etapas[0].intervalo);
    return () => {
      parado = true;
      clearTimeout(timer);
    };
  }, [loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { errors, normalizedPayload } = validateAndNormalizeForm();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstField = Object.keys(errors)[0];
      const firstElement = document.querySelector(
        `[name="${firstField}"]`
      ) as HTMLElement | null;
      firstElement?.focus();
      return;
    }

    setFieldErrors({});
    setLoading(true);
    setResultado(null);

    try {
      const res = await fetch("/api/gerar-treino", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedPayload),
      });

      const data = await res.json().catch(() => ({}));

      if (data.erro === "token_invalido") {
        setLoading(false);
        alert(
          "Seu link de acesso não é mais válido. Entre em contato com o suporte."
        );
        return;
      }

      if (data.erro === "dados_invalidos") {
        const detalhes = data?.detalhes ?? {};
        const primeiroCampo = Object.keys(detalhes)[0];
        const primeiraMensagem =
          primeiroCampo && Array.isArray(detalhes[primeiroCampo])
            ? detalhes[primeiroCampo][0]
            : null;

        setLoading(false);
        alert(
          primeiroCampo
            ? `Campo inválido: ${primeiroCampo}. ${primeiraMensagem ?? "Confira os dados e tente novamente."}`
            : "Dados inválidos no formulário. Confira os campos e tente novamente."
        );
        return;
      }

      if (!res.ok) {
        setLoading(false);
        alert("Erro ao gerar o treino. Tente novamente em instantes.");
        return;
      }

      if (!data?.resultado || typeof data.resultado !== "string") {
        setLoading(false);
        alert("Não foi possível gerar seu treino agora. Tente novamente.");
        return;
      }

      setProgresso(100);
      setMensagem("Plano gerado com sucesso!");

      setTimeout(() => {
        setResultado(data.resultado);
        setLoading(false);
        if (typeof window !== "undefined") {
          window.localStorage.removeItem(draftStorageKey);
          window.localStorage.removeItem(LAST_ORDER_CODE_KEY);
        }
      }, 600);
    } catch {
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
          <h1
            key={i}
            className="text-xl md:text-2xl font-bold text-white text-center mb-4 mt-2 border-b border-red-600/40 pb-3"
          >
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
          if (
            sub.startsWith("- Séries:") ||
            sub.startsWith("- Repetições:") ||
            sub.startsWith("- Descanso:") ||
            sub.startsWith("- Tempo:")
          ) {
            const [label, ...resto] = sub.replace("- ", "").split(":");
            props.push({ label: label.trim(), valor: resto.join(":").trim() });
            j++;
          } else break;
        }

        elementos.push(
          <div
            key={i}
            className="bg-zinc-800/60 border border-zinc-700 rounded-xl p-4 mb-3"
          >
            <p className="text-white font-semibold mb-3">{nome}</p>
            <div className="flex flex-wrap gap-2">
              {props.map((p, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-center min-w-[85px]"
                >
                  <p className="text-gray-500 text-xs uppercase tracking-wide">
                    {p.label}
                  </p>
                  <p className="text-red-400 font-bold text-sm mt-1">
                    {p.valor}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

        i = j;
        continue;
      } else if (
        linha.startsWith("- ") &&
        !linha.match(/^- (Séries|Repetições|Descanso|Tempo):/)
      ) {
        elementos.push(
          <li
            key={i}
            className="text-gray-300 ml-4 list-disc leading-relaxed text-sm"
          >
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
          <p
            key={i}
            className={`leading-relaxed text-sm ${
              ehSecao ? "text-red-400 font-bold mt-4" : "text-gray-300"
            }`}
          >
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
              <input
                name="idade"
                placeholder="Idade"
                required
                value={form.idade}
                onChange={handleChange}
                inputMode="numeric"
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              />
              {fieldErrors.idade && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.idade}</p>
              )}
              <input
                name="peso"
                placeholder="Peso (kg)"
                required
                value={form.peso}
                onChange={handleChange}
                inputMode="decimal"
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              />
              {fieldErrors.peso && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.peso}</p>
              )}
              <input
                name="altura"
                placeholder="Altura (cm)"
                required
                value={form.altura}
                onChange={handleChange}
                inputMode="decimal"
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              />
              {fieldErrors.altura && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.altura}</p>
              )}

              <select
                name="dias"
                required
                value={form.dias}
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              >
                <option value="">Dias por semana</option>
                <option value="2">2 dias</option>
                <option value="3">3 dias</option>
                <option value="4">4 dias</option>
                <option value="5">5 dias</option>
                <option value="6">6 dias</option>
                <option value="7">7 dias</option>
              </select>
              {fieldErrors.dias && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.dias}</p>
              )}

              <select
                name="objetivo"
                required
                value={form.objetivo}
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              >
                <option value="">Objetivo</option>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="definicao">Definição</option>
                <option value="emagrecimento">Emagrecimento</option>
              </select>
              {fieldErrors.objetivo && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.objetivo}</p>
              )}

              <select
                name="nivel"
                required
                value={form.nivel}
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              >
                <option value="">Nível</option>
                <option value="iniciante">Iniciante</option>
                <option value="intermediario">Intermediário</option>
                <option value="avancado">Avançado</option>
              </select>
              {fieldErrors.nivel && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.nivel}</p>
              )}

              <select
                name="local"
                required
                value={form.local}
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              >
                <option value="">Onde vai treinar?</option>
                <option value="academia">Academia</option>
                <option value="casa">Em casa (halteres / elásticos)</option>
                <option value="sem_equipamento">Sem equipamento (peso corporal)</option>
              </select>
              {fieldErrors.local && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.local}</p>
              )}

              <input
                name="limitacoes"
                placeholder="Lesões ou limitações físicas (opcional)"
                value={form.limitacoes}
                onChange={handleChange}
                className="bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
              />
              {fieldErrors.limitacoes && (
                <p className="text-red-400 text-xs -mt-2">{fieldErrors.limitacoes}</p>
              )}

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
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-white mb-4">
              {mensagem}
            </h2>
            <div className="w-full bg-zinc-800 rounded-full h-4 overflow-hidden">
              <div
                className="bg-red-600 h-4 transition-all duration-500 rounded-full"
                style={{ width: `${progresso}%` }}
              />
            </div>
            <p className="text-gray-400 mt-3 text-sm">{progresso}%</p>
          </div>
        )}

        {resultado && !loading && (
          <div>
            <div className="text-center mb-6">
              <span className="text-4xl">💪</span>
              <h2 className="text-2xl font-bold text-white mt-2">
                Seu Plano Está Pronto!
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                Role para baixo para ver o plano completo
              </p>
            </div>

            <div className="bg-zinc-800/40 border border-zinc-700 rounded-xl p-5 max-h-[50vh] overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-zinc-800">
              {formatarResultado(resultado)}
            </div>

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
                  <>📄 Baixar Plano em PDF</>
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
