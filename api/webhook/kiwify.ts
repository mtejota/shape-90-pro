import crypto from "crypto";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ── 1. Validar assinatura da Kiwify ─────────────────────────────────────────
  // A Kiwify envia um header com assinatura HMAC para garantir autenticidade
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

  const { event, Customer, order_id } = req.body;
  console.log(`[Kiwify] Evento recebido: ${event} | Pedido: ${order_id}`);

  // ── 2. Pagamento aprovado ────────────────────────────────────────────────────
  if (event === "purchase.approved") {
    const email = Customer?.email;
    const nome = Customer?.full_name || "Cliente";

    if (!email) {
      return res.status(400).json({ error: "Email não encontrado no payload" });
    }

    // Gera um token único e seguro (64 caracteres hex)
    const token = crypto.randomBytes(32).toString("hex");
    const expiraEm = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 dias

    // ── Salva no Supabase ──────────────────────────────────────────────────────
    const salvo = await supabaseInsert({
      email,
      token,
      order_id,
      usado: false,
      expira_em: expiraEm.toISOString(),
    });

    if (!salvo) {
      console.error("[Supabase] Falha ao salvar token");
      return res.status(500).json({ error: "Erro ao registrar acesso" });
    }

    // ── Envia email com o link ─────────────────────────────────────────────────
    const siteUrl = process.env.SITE_URL || "https://projeto90d.vercel.app/";
    const linkAcesso = `${siteUrl}/formulario?token=${token}`;

    await enviarEmail({ to: email, nome, link: linkAcesso });

    console.log(`[OK] Token criado e email enviado para ${email}`);
    return res.status(200).json({ ok: true });
  }

  // ── 3. Reembolso — bloqueia o acesso ────────────────────────────────────────
  if (event === "purchase.refunded") {
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
// Helpers — Supabase REST (sem precisar instalar SDK)
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

// ─────────────────────────────────────────────────────────────────────────────
// Envio de email via Resend (grátis: 3.000 emails/mês)
// ─────────────────────────────────────────────────────────────────────────────

async function enviarEmail({
  to,
  nome,
  link,
}: {
  to: string;
  nome: string;
  link: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[Resend] RESEND_API_KEY não configurada — email não enviado");
    return;
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: `Shape 90 Pro <noreply@resend.dev>`,
        to: [to],
        subject: "🔥 Seu acesso ao Projeto 90D está pronto!",
        html: `
          <div style="background:#0a0a0a;color:#fff;font-family:sans-serif;padding:40px;max-width:520px;margin:auto;border-radius:12px">
            <h1 style="color:#dc2626;margin:0 0 4px">PROJETO 90D</h1>
            <p style="color:#666;margin:0 0 28px;font-size:14px">Transformação Inteligente</p>

            <p style="margin:0 0 8px">Olá, <strong>${nome}</strong>! 🎉</p>
            <p style="color:#aaa;margin:0 0 24px;line-height:1.6">
              Seu pagamento foi confirmado. Clique no botão abaixo para gerar seu plano de treino personalizado de 90 dias:
            </p>

            <a href="${link}"
              style="display:inline-block;background:#dc2626;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;margin-bottom:24px">
              🚀 Acessar Meu Plano Agora
            </a>

            <div style="background:#111;border-radius:8px;padding:16px;margin-bottom:24px">
              <p style="margin:0;font-size:13px;color:#888">
                ⏳ Link válido por <strong style="color:#fff">7 dias</strong><br/>
                🔒 Não compartilhe este link — ele é exclusivo para você<br/>
                📱 Funciona no celular e computador
              </p>
            </div>

            <hr style="border:1px solid #222;margin:0 0 16px"/>
            <p style="color:#444;font-size:12px;margin:0">
              Shape 90 Pro · Dúvidas? Responda este email.
            </p>
          </div>
        `,
      }),
    });

    if (!res.ok) {
      console.error("[Resend] Erro ao enviar email:", await res.text());
    } else {
      console.log("[Resend] Email enviado para", to);
    }
  } catch (err) {
    console.error("[Resend] Erro ao enviar email:", err);
  }
}
