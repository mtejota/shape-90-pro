import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type Status = "idle" | "loading" | "nao_encontrado" | "erro";

const MAX_TENTATIVAS = 12;
const INTERVALO_MS = 5000;

export default function AcessoPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [tentativa, setTentativa] = useState(0);
  const [mensagem, setMensagem] = useState("");
  const emailRef = useRef("");

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  const resolverAcesso = async (emailAtual: string, modoAuto = false) => {
    const emailNormalizado = emailAtual.trim().toLowerCase();
    if (!emailNormalizado) {
      setMensagem("Digite seu e-mail de compra para continuar.");
      setStatus("erro");
      return false;
    }

    setStatus("loading");
    if (!modoAuto) {
      setTentativa(0);
    }

    try {
      const res = await fetch("/api/resolver-acesso", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailNormalizado }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.ok && typeof data.order_code === "string") {
        navigate(`/formulario?order_code=${encodeURIComponent(data.order_code)}`);
        return true;
      }

      if (res.status === 404 && data?.erro === "acesso_nao_encontrado") {
        setStatus("nao_encontrado");
        setMensagem(
          "Pagamento ainda não confirmado no sistema. Vamos tentar novamente automaticamente."
        );
        return false;
      }

      setStatus("erro");
      setMensagem("Não foi possível validar seu acesso agora. Tente novamente.");
      return false;
    } catch {
      setStatus("erro");
      setMensagem("Erro de conexão ao validar acesso. Tente novamente.");
      return false;
    }
  };

  useEffect(() => {
    if (status !== "nao_encontrado") return;
    if (tentativa >= MAX_TENTATIVAS) return;

    const timer = setTimeout(async () => {
      const nextTry = tentativa + 1;
      setTentativa(nextTry);
      const ok = await resolverAcesso(emailRef.current, true);
      if (!ok && nextTry >= MAX_TENTATIVAS) {
        setStatus("erro");
        setMensagem(
          "Ainda não encontramos seu acesso. Aguarde alguns minutos e tente novamente."
        );
      }
    }, INTERVALO_MS);

    return () => clearTimeout(timer);
  }, [status, tentativa]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resolverAcesso(email, false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 border border-red-600/30 rounded-2xl p-7 shadow-2xl">
        <h1 className="text-2xl font-bold text-white text-center mb-2">
          Acessar Formulário
        </h1>
        <p className="text-gray-400 text-sm text-center mb-6">
          Digite o mesmo e-mail usado na compra para liberar seu acesso.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seuemail@exemplo.com"
            className="w-full bg-black border border-zinc-700 p-3 rounded-lg text-white focus:border-red-600 outline-none"
          />

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed transition p-3 rounded-lg font-bold text-white"
          >
            {status === "loading" ? "Validando acesso..." : "Continuar"}
          </button>
        </form>

        {mensagem && (
          <p className="text-sm text-center mt-4 text-gray-300">{mensagem}</p>
        )}

        {status === "nao_encontrado" && (
          <p className="text-xs text-center mt-2 text-gray-500">
            Tentativa automática {tentativa}/{MAX_TENTATIVAS}
          </p>
        )}
      </div>
    </div>
  );
}
