export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = req.body ?? {};
  const event = body?.event;
  const data = body?.data ?? {};
  const payloadSecret = body?.secret;
  const configuredSecret = process.env.CAKTO_WEBHOOK_SECRET;

  // Em produção, sempre valide o segredo para bloquear payload forjado.
  if (configuredSecret) {
    if (!payloadSecret || payloadSecret !== configuredSecret) {
      console.error("[Cakto] Secret inválido no payload");
      return res.status(401).json({ error: "Unauthorized" });
    }
  }

  const orderId = asString(data?.id);
  const orderRef = asString(data?.refId);
  const status = asString(data?.status);
  const email = asString(data?.customer?.email);
  const nome = asString(data?.customer?.name) || "Cliente";
  const accessCode = orderRef || orderId;

  console.log(
    `[Cakto] Evento recebido: ${event} | Status: ${status} | Pedido: ${orderId} | Ref: ${orderRef}`
  );

  if (isPaidEvent(event, status)) {
    if (!email) {
      return res.status(400).json({ error: "Email não encontrado no payload" });
    }
    if (!accessCode) {
      return res
        .status(400)
        .json({ error: "id/refId não encontrado no payload" });
    }

    const salvo = await supabaseInsert({
      email,
      nome,
      order_id: orderId || undefined,
      accessCode,
    });

    if (!salvo) {
      console.error("[Supabase] Falha ao salvar acesso Cakto");
      return res.status(500).json({ error: "Erro ao registrar acesso" });
    }

    console.log(
      `[OK] [Cakto] Acesso registrado para ${email} com order_ref=${accessCode}`
    );
    return res.status(200).json({ ok: true, order_ref: accessCode });
  }

  if (isBlockedEvent(event, status)) {
    if (email) {
      await supabaseRevogar(email);
      console.log(`[OK] [Cakto] Acesso revogado para ${email}`);
    }
    return res.status(200).json({ ok: true });
  }

  return res.status(200).json({ ok: true, ignored: true });
}

function asString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeValue(value: unknown): string {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[.\s-]/g, "_");
}

function isPaidEvent(event: unknown, status: unknown): boolean {
  const ev = normalizeValue(event);
  const st = normalizeValue(status);
  return ev === "purchase_approved" || st === "paid" || st === "authorized";
}

function isBlockedEvent(event: unknown, status: unknown): boolean {
  const ev = normalizeValue(event);
  const st = normalizeValue(status);
  return (
    ev === "purchase_refunded" ||
    ev === "purchase_chargedback" ||
    ev === "purchase_canceled" ||
    st === "refunded" ||
    st === "chargedback" ||
    st === "canceled"
  );
}

async function supabaseInsert(data: {
  email: string;
  nome: string;
  order_id?: string;
  accessCode: string;
}): Promise<boolean> {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;
  const now = new Date();
  const expiraEm = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

  // Idempotência simples: se já existe por order_ref ou order_id, considera sucesso.
  for (const campo of ["order_ref", "order_id"] as const) {
    const valor = campo === "order_ref" ? data.accessCode : data.order_id;
    if (!valor) continue;
    const checkRes = await fetch(
      `${url}/rest/v1/acessos?${campo}=eq.${encodeURIComponent(valor)}&select=id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      }
    );
    if (checkRes.ok) {
      const rows = await checkRes.json();
      if (Array.isArray(rows) && rows.length > 0) return true;
    }
  }

  const tentativas = [
    {
      email: data.email,
      nome: data.nome,
      order_id: data.order_id,
      order_ref: data.accessCode,
      usado: false,
      criado_em: now.toISOString(),
    },
    {
      email: data.email,
      order_id: data.order_id,
      order_ref: data.accessCode,
      usado: false,
      criado_em: now.toISOString(),
    },
    {
      email: data.email,
      token: data.accessCode,
      order_id: data.order_id,
      usado: false,
      expira_em: expiraEm,
      criado_em: now.toISOString(),
    },
  ];

  for (const payload of tentativas) {
    const createRes = await fetch(`${url}/rest/v1/acessos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "return=minimal",
      },
      body: JSON.stringify(payload),
    });

    if (createRes.ok) return true;
    console.error(
      "[Supabase] Tentativa de insert Cakto falhou:",
      createRes.status,
      await createRes.text()
    );
  }

  return false;
}

async function supabaseRevogar(email: string): Promise<void> {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_KEY!;

  await fetch(`${url}/rest/v1/acessos?email=eq.${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ usado: true }),
  });
}
