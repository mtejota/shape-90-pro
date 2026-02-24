-- ══════════════════════════════════════════════════════════════════════════════
-- Execute este SQL no Supabase:
-- Painel → SQL Editor → colar aqui → Run
-- ══════════════════════════════════════════════════════════════════════════════

CREATE TABLE acessos (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT        NOT NULL,
  token      TEXT        NOT NULL UNIQUE,
  order_id   TEXT,
  usado      BOOLEAN     DEFAULT FALSE,
  expira_em  TIMESTAMPTZ NOT NULL,
  criado_em  TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas rápidas
CREATE INDEX idx_acessos_token ON acessos (token);
CREATE INDEX idx_acessos_email ON acessos (email);

-- Segurança: bloqueia acesso público direto (só a service_key tem permissão)
ALTER TABLE acessos ENABLE ROW LEVEL SECURITY;
