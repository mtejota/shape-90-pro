export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, erro: "metodo_nao_permitido" });
  }

  const emailRaw = req.body?.email;
  const email = typeof emailRaw === "string" ? emailRaw.trim().toLowerCase() : "";

  if (!email || !isEmailValido(email)) {
    return res.status(400).json({ ok: false, erro: "email_invalido" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.error("[resolver-acesso] Variáveis de ambiente do Supabase ausentes");
    return res.status(500).json({ ok: false, erro: "erro_servidor" });
  }

  try {
    const response = await fetch(
      `${url}/rest/v1/acessos?email=eq.${encodeURIComponent(email)}&usado=eq.false&select=order_ref,order_id,criado_em&order=criado_em.desc&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    if (!response.ok) {
      console.error("[resolver-acesso] Erro Supabase:", await response.text());
      return res.status(500).json({ ok: false, erro: "erro_servidor" });
    }

    const lista = await response.json();
    const registro = Array.isArray(lista) ? (lista[0] ?? null) : null;

    if (!registro) {
      return res.status(404).json({ ok: false, erro: "acesso_nao_encontrado" });
    }

    const order_code = sanitizeOrderCode(registro.order_ref) || sanitizeOrderCode(registro.order_id);
    if (!order_code) {
      return res.status(404).json({ ok: false, erro: "acesso_sem_codigo" });
    }

    return res.status(200).json({ ok: true, order_code });
  } catch (err) {
    console.error("[resolver-acesso] Erro:", err);
    return res.status(500).json({ ok: false, erro: "erro_servidor" });
  }
}

function isEmailValido(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function sanitizeOrderCode(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}
