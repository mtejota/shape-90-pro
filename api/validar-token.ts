export default async function handler(req: any, res: any) {
  // Aceita GET (chamado pelo frontend via query string)
  const token =
    req.method === "GET" ? req.query?.token : req.body?.token;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ valido: false, motivo: "token_ausente" });
  }

  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;

  // ── Busca o token no banco ───────────────────────────────────────────────────
  let registro: any = null;

  try {
    const response = await fetch(
      `${url}/rest/v1/acessos?token=eq.${encodeURIComponent(token)}&select=*&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );

    if (!response.ok) {
      console.error("[Supabase] Erro na consulta:", await response.text());
      return res.status(500).json({ valido: false, motivo: "erro_servidor" });
    }

    const lista = await response.json();
    registro = lista?.[0] ?? null;
  } catch (err) {
    console.error("[validar-token] Erro:", err);
    return res.status(500).json({ valido: false, motivo: "erro_servidor" });
  }

  // ── Checagens de segurança ───────────────────────────────────────────────────
  if (!registro) {
    return res.status(200).json({ valido: false, motivo: "token_invalido" });
  }

  if (registro.usado) {
    return res.status(200).json({ valido: false, motivo: "token_ja_usado" });
  }

  if (new Date(registro.expira_em) < new Date()) {
    return res.status(200).json({ valido: false, motivo: "token_expirado" });
  }

  // ── Token válido ─────────────────────────────────────────────────────────────
  return res.status(200).json({ valido: true, email: registro.email });
}
