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

  // A Kiwify pode variar o formato do payload entre integrações.
  // Suportamos dados na raiz e dentro de "order", com chaves em formatos diferentes.
  const order = req.body?.order ?? req.body;
  const event =
    order?.webhook_event_type ??
    order?.event ??
    req.body?.event ??
    req.body?.webhook_event_type;
  const customer = order?.Customer ?? order?.customer ?? req.body?.Customer ?? req.body?.customer;
  const order_id = order?.order_id ?? order?.id ?? req.body?.order_id ?? req.body?.id;
  const order_ref =
    order?.order_ref ??
    order?.reference ??
    req.body?.order_ref ??
    req.body?.reference;
  console.log(`[Kiwify] Evento recebido: ${event} | Pedido: ${order_id} | Ref: ${order_ref}`);

  // ── 2. Pagamento aprovado ────────────────────────────────────────────────────
  if (isPaidEvent(event)) {
    const email = customer?.email;
    const nome = customer?.full_name || customer?.name || "Cliente";
    // Fallback importante: se order_ref não vier, usa order_id para casar com ?order_code do checkout.
    const accessCode = order_ref || order_id;

    if (!email) {
      return res.status(400).json({ error: "Email não encontrado no payload" });
    }

    if (!accessCode) {
      return res.status(400).json({ error: "order_ref/order_id não encontrado no payload" });
    }

    // ── Salva no Supabase ──────────────────────────────────────────────────────
    const salvo = await supabaseInsert({
      email,
      nome,
      order_id,
      order_ref: accessCode, // esse é o valor usado como ?order_code= na URL
      usado: false,
      criado_em: new Date().toISOString(),
    });

    if (!salvo) {
      console.error("[Supabase] Falha ao salvar acesso");
      return res.status(500).json({ error: "Erro ao registrar acesso" });
    }

    console.log(`[OK] Acesso registrado para ${email} com order_ref=${accessCode}`);
    return res.status(200).json({ ok: true, order_ref: accessCode });
  }

  // ── 3. Reembolso — bloqueia o acesso ────────────────────────────────────────
  if (isRefundEvent(event)) {
    const email = customer?.email;
    if (email) {
      await supabaseRevogar(email);
      console.log(`[OK] Acesso revogado para ${email}`);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true, ignored: true });
}

function normalizeEvent(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.\s-]/g, "_");
}

function isPaidEvent(value: unknown): boolean {
  const ev = normalizeEvent(value);
  return ev === "order_approved" || ev === "order_paid";
}

function isRefundEvent(value: unknown): boolean {
  const ev = normalizeEvent(value);
  return ev === "order_refunded" || ev === "order_refund";
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
