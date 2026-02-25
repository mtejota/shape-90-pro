import crypto from "crypto";

export default async function handler(req: any, res: any) {
  console.log("[Kiwify] Headers:", JSON.stringify(req.headers, null, 2));
  console.log("[Kiwify] Body:", JSON.stringify(req.body, null, 2));

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── 1. Validar assinatura da Kiwify ─────────────────────────────────────────
  const signature = req.headers["x-kiwify-signature"] as string;
  const secret = process.env.KIWIFY_WEBHOOK_SECRET;

  if (secret && signature) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(JSON.stringify(req.body))
      .digest("hex");

    if (signature !== expected) {
      console.error("[Kiwify] Assinatura inválida — possível requisição forjada");
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  // A Kiwify às vezes envia os dados direto na raiz, às vezes dentro de "order"
  const order = req.body?.order ?? req.body;
  const event = order?.webhook_event_type;
  const Customer = order?.Customer;
  const order_id = order?.order_id;
  const order_ref = order?.order_ref;
  console.log(`[Kiwify] Evento recebido: ${event} | Pedido: ${order_id} | Ref: ${order_ref}`);

  // ── 2. Pagamento aprovado ────────────────────────────────────────────────────
  if (event === "order_approved") {
    const email = Customer?.email;
    const nome = Customer?.full_name || "Cliente";

    if (!email) {
      return res.status(400).json({ error: "Email não encontrado no payload" });
    }

    if (!order_ref) {
      return res.status(400).json({ error: "order_ref não encontrado no payload" });
    }

    // ── Salva no Supabase ──────────────────────────────────────────────────────
    const salvo = await supabaseInsert({
      email,
      nome,
      order_id,
      order_ref,   // esse é o valor que vai aparecer como ?order_code= na URL
      usado: false,
      criado_em: new Date().toISOString(),
    });

    if (!salvo) {
      console.error("[Supabase] Falha ao salvar acesso");
      return res.status(500).json({ error: "Erro ao registrar acesso" });
    }

    console.log(`[OK] Acesso registrado para ${email} com order_ref=${order_ref}`);
    return res.status(200).json({ ok: true });
  }

  // ── 3. Reembolso — bloqueia o acesso ────────────────────────────────────────
  if (event === "order_refunded") {
    const email = Customer?.email;
    if (email) {
      await supabaseRevogar(email);
      console.log(`[OK] Acesso revogado para ${email}`);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true, ignored: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers — Supabase REST
// ─────────────────────────────────────────────────────────────────────────────

async function supabaseInsert(data: object): Promise<boolean> {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;

  const res = await fetch(`${url}/rest/v1/acessos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    console.error("[Supabase] Status:", res.status, await res.text());
  }

  return res.ok;
}

async function supabaseRevogar(email: string): Promise<void> {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;

  await fetch(
    `${url}/rest/v1/acessos?email=eq.${encodeURIComponent(email)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ usado: true }),
    }
  );
}
