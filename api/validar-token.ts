export default async function handler(req: any, res: any) {
  if (req.method !== "GET" && req.method !== "POST") {
    return res.status(405).json({ valido: false, motivo: "metodo_nao_permitido" });
  }

  const rawOrderCode =
    req.method === "GET" ? req.query?.order_code : req.body?.order_code;
  const firstOrderCode = Array.isArray(rawOrderCode) ? rawOrderCode[0] : rawOrderCode;
  const order_code =
    typeof firstOrderCode === "string" ? firstOrderCode.trim() : firstOrderCode;

  if (!order_code || typeof order_code !== "string") {
    return res.status(400).json({ valido: false, motivo: "token_ausente" });
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;

  if (!url || !key) {
    console.error("[validar-token] Variáveis de ambiente do Supabase ausentes");
    return res.status(500).json({ valido: false, motivo: "erro_servidor" });
  }

  let registro: any = null;

  try {
    for (const campo of ["order_ref", "order_id"] as const) {
      const response = await fetch(
        `${url}/rest/v1/acessos?${campo}=eq.${encodeURIComponent(order_code)}&select=*&order=criado_em.desc&limit=1`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
          },
        }
      );

      if (!response.ok) {
        console.error(`[Supabase] Erro na consulta por ${campo}:`, await response.text());
        continue;
      }

      const lista = await response.json();
      const encontrado = Array.isArray(lista) ? (lista[0] ?? null) : null;
      if (encontrado) {
        registro = encontrado;
        break;
      }
    }
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
