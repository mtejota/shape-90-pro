export default async function handler(req: any, res: any) {
  const order_code =
    req.method === "GET" ? req.query?.order_code : req.body?.order_code;

  if (!order_code || typeof order_code !== "string") {
    return res.status(400).json({ valido: false, motivo: "token_ausente" });
  }

  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;

  let registro: any = null;

  try {
    const response = await fetch(
      `${url}/rest/v1/acessos?order_ref=eq.${encodeURIComponent(order_code)}&select=*&limit=1`,
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

  if (!registro) {
    return res.status(200).json({ valido: false, motivo: "token_invalido" });
  }

  if (registro.usado) {
    return res.status(200).json({ valido: false, motivo: "token_ja_usado" });
  }

  // ── Válido ───────────────────────────────────────────────────────────────────
  return res.status(200).json({ valido: true, email: registro.email });
}