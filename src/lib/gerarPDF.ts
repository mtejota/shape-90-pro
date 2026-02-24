import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZAÇÃO — preserva acentos portugueses, remove apenas emojis e símbolos
// problemáticos para o jsPDF (não-ASCII exceto Latin-1 Extended)
// ─────────────────────────────────────────────────────────────────────────────
const safe = (texto: string): string =>
  texto
    // Converte travessões tipográficos
    .replace(/[–—]/g, "-")
    // Remove emojis e símbolos fora do Latin Extended (mantém acentos pt-BR)
    .replace(/[^\u0000-\u00FF]/g, "")
    // Remove qualquer marcação markdown residual
    .replace(/\*{1,2}/g, "")
    .replace(/#{1,6}\s*/g, "")
    .trim();

// ─────────────────────────────────────────────────────────────────────────────
// Limpa APENAS marcação markdown, preservando o texto e acentos
// ─────────────────────────────────────────────────────────────────────────────
const stripMd = (linha: string): string =>
  linha
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1") // **bold**, *italic*, ***bold-italic***
    .replace(/\*{1,3}/g, "")                  // asteriscos soltos
    .replace(/`([^`]+)`/g, "$1")              // `código`
    .replace(/^\s*#{1,6}\s+/, "")             // ## no início da linha
    .replace(/[–—]/g, "-")
    .replace(/[^\u0000-\u00FF]/g, "")         // remove emojis
    .trim();

// ─────────────────────────────────────────────────────────────────────────────
// Detecta nível do título markdown
// ─────────────────────────────────────────────────────────────────────────────
const nivelTitulo = (linha: string): number => {
  const m = linha.match(/^(#{1,6})\s/);
  return m ? m[1].length : 0;
};

// ─────────────────────────────────────────────────────────────────────────────
// PALETA
// ─────────────────────────────────────────────────────────────────────────────
const C = {
  preto:         [0,   0,   0]   as [number, number, number],
  vermelho:      [220, 38,  38]  as [number, number, number],
  vermelhoEsc:   [150, 20,  20]  as [number, number, number],
  vermelhoMid:   [180, 28,  28]  as [number, number, number],
  branco:        [255, 255, 255] as [number, number, number],
  cinzaClaro:    [200, 200, 200] as [number, number, number],
  cinzaMedio:    [140, 140, 140] as [number, number, number],
  cinzaEscuro:   [30,  30,  30]  as [number, number, number],
  cinzaCard:     [22,  22,  22]  as [number, number, number],
  cinzaBadge:    [12,  12,  12]  as [number, number, number],
  amareloAlerta: [200, 140, 0]   as [number, number, number],
  verdeOk:       [34,  197, 94]  as [number, number, number],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export async function gerarPDF(resultado: string, dadosAluno: any) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pw  = pdf.internal.pageSize.getWidth();
  const ph  = pdf.internal.pageSize.getHeight();
  const mX  = 14;
  const cW  = pw - mX * 2;
  let   y   = 0;

  const fill   = (c: [number, number, number]) => pdf.setFillColor(...c);
  const stroke = (c: [number, number, number]) => pdf.setDrawColor(...c);
  const color  = (c: [number, number, number]) => pdf.setTextColor(...c);

  // ── Fundo padrão de página ──────────────────────────────────────────────────
  const fundoBase = () => {
    fill(C.preto);
    pdf.rect(0, 0, pw, ph, "F");
    fill(C.vermelho);
    pdf.rect(0, 0, pw, 2, "F");
  };

  // ── Rodapé ──────────────────────────────────────────────────────────────────
  const rodape = (num: number, total: number) => {
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.3);
    pdf.line(mX, ph - 10, pw - mX, ph - 10);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    color(C.vermelho);
    pdf.text("PROJETO 90D", mX, ph - 5);
    pdf.setFont("helvetica", "normal");
    color(C.cinzaMedio);
    pdf.text(new Date().toLocaleDateString("pt-BR"), pw / 2, ph - 5, { align: "center" });
    pdf.setFont("helvetica", "bold");
    pdf.text(`${num} / ${total}`, pw - mX, ph - 5, { align: "right" });
  };

  // ── Nova página ──────────────────────────────────────────────────────────────
  const novaPag = () => {
    pdf.addPage();
    fundoBase();
    y = 18;
  };

  // ── Checa espaço disponível ──────────────────────────────────────────────────
  const chk = (esp: number) => {
    if (y + esp > ph - 16) novaPag();
  };

  // ── Dados calculados ─────────────────────────────────────────────────────────
  const pesoN  = Number(String(dadosAluno.peso).replace(",", "."));
  const altN   = Number(String(dadosAluno.altura).replace(",", "."));
  const imcVal = (pesoN / ((altN / 100) ** 2)).toFixed(1);
  const imcCls = Number(imcVal) < 18.5 ? "Abaixo do peso" :
                 Number(imcVal) < 25   ? "Peso normal"    :
                 Number(imcVal) < 30   ? "Sobrepeso"      : "Obesidade";

  const objLabel  = dadosAluno.objetivo === "hipertrofia" ? "Hipertrofia" :
                    dadosAluno.objetivo === "definicao"   ? "Definicao"   : "Emagrecimento";
  const nivLabel  = dadosAluno.nivel === "iniciante"      ? "Iniciante"     :
                    dadosAluno.nivel === "intermediario"  ? "Intermediario" : "Avancado";

  // Score de potencial
  let scoreBase = 7;
  if (Number(imcVal) < 18.5) scoreBase -= 1;
  if (Number(imcVal) > 30)   scoreBase -= 2;
  if (dadosAluno.nivel === "iniciante") scoreBase += 1;
  if (dadosAluno.nivel === "avancado")  scoreBase -= 1;
  const score = Math.max(4, Math.min(10, scoreBase));
  const scoreTxt =
    score >= 8 ? "Seu perfil apresenta alto potencial de evolucao muscular."
    : score >= 6 ? "Seu potencial e solido com excelente margem de progresso."
    : "Seu progresso exigira foco estrategico e aderencia ao plano.";

  // ─────────────────────────────────────────────────────────────────────────────
  // CAPA
  // ─────────────────────────────────────────────────────────────────────────────
  fundoBase();

  // Faixa vermelha topo
  fill(C.vermelhoEsc);
  pdf.rect(0, 0, pw, 68, "F");
  fill(C.preto);
  pdf.rect(0, 16, pw, 52, "F");

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(38);
  color(C.vermelho);
  pdf.text("PROJETO 90D", pw / 2, 70, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  color(C.cinzaMedio);
  pdf.text("PLANO DE TREINAMENTO PERSONALIZADO", pw / 2, 78, { align: "center" });

  stroke(C.vermelho);
  pdf.setLineWidth(0.7);
  pdf.line(mX + 20, 83, pw - mX - 20, 83);

  // ── Card dados do aluno ───────────────────────────────────────────────────────
  const cardY = 88;
  fill(C.cinzaCard);
  pdf.roundedRect(mX, cardY, cW, 92, 3, 3, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(mX, cardY, cW, 92, 3, 3, "S");

  fill(C.vermelhoEsc);
  pdf.roundedRect(mX, cardY, cW, 13, 3, 3, "F");
  pdf.rect(mX, cardY + 7, cW, 6, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  color(C.branco);
  pdf.text("DADOS DO ALUNO", mX + 8, cardY + 9);

  stroke(C.vermelhoEsc);
  pdf.setLineWidth(0.3);
  pdf.line(mX + 6, cardY + 13, pw - mX - 6, cardY + 13);

  // 6 badges em grid 3x2
  const metricas = [
    { label: "IDADE",       valor: `${dadosAluno.idade} anos` },
    { label: "OBJETIVO",    valor: objLabel },
    { label: "PESO",        valor: `${dadosAluno.peso} kg` },
    { label: "NIVEL",       valor: nivLabel },
    { label: "ALTURA",      valor: `${dadosAluno.altura} cm` },
    { label: "DIAS/SEMANA", valor: `${dadosAluno.dias} dias` },
  ];
  const badgeW = (cW - 10) / 3;
  metricas.forEach((m, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const bx  = mX + 3 + col * (badgeW + 2);
    const by  = cardY + 17 + row * 19;
    fill(C.cinzaBadge);
    pdf.roundedRect(bx, by, badgeW, 15, 2, 2, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    color(C.cinzaMedio);
    pdf.text(m.label, bx + badgeW / 2, by + 5.5, { align: "center" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    color(C.branco);
    pdf.text(safe(m.valor), bx + badgeW / 2, by + 12, { align: "center" });
  });

  // Badge IMC com cor indicativa
  const imcY = cardY + 17 + 2 * 19;
  fill(C.cinzaBadge);
  pdf.roundedRect(mX + 3, imcY, cW - 6, 15, 2, 2, "F");
  const imcCor: [number, number, number] =
    Number(imcVal) < 18.5 ? C.amareloAlerta :
    Number(imcVal) < 25   ? C.verdeOk :
    Number(imcVal) < 30   ? C.amareloAlerta : C.vermelho;
  fill(imcCor);
  pdf.roundedRect(mX + 3, imcY, 4, 15, 2, 2, "F");
  pdf.rect(mX + 5, imcY, 2, 15, "F");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  color(C.cinzaMedio);
  pdf.text("IMC", mX + 12, imcY + 5.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  color(C.branco);
  pdf.text(`${imcVal}  -  ${imcCls}`, mX + 12, imcY + 12);

  // Data
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  color(C.cinzaMedio);
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  pdf.text(safe(`Gerado em ${dataHoje}`), pw / 2, 192, { align: "center" });

  // Frase motivacional
  fill(C.vermelhoEsc);
  pdf.rect(mX, 197, cW, 20, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.rect(mX, 197, cW, 20, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  color(C.branco);
  pdf.text('"90 DIAS PODEM MUDAR O SEU CORPO PARA SEMPRE."', pw / 2, 209, { align: "center" });

  // Badges de benefícios — usando texto ASCII seguro em vez de emoji
  const bens = [
    { icone: "+", txt: "Treino personalizado" },
    { icone: "+", txt: "Progressao cientifica" },
    { icone: "+", txt: "Resultados em 90 dias" },
    { icone: "+", txt: "PDF exclusivo" },
  ];
  const benW = (cW - 6) / 4;
  bens.forEach((b, idx) => {
    const bx = mX + idx * (benW + 2);
    fill(C.cinzaCard);
    pdf.roundedRect(bx, 222, benW, 20, 2, 2, "F");
    stroke(C.verdeOk);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(bx, 222, benW, 20, 2, 2, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    color(C.verdeOk);
    pdf.text(b.icone, bx + benW / 2, 231, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    color(C.cinzaClaro);
    const wrapped = pdf.splitTextToSize(b.txt, benW - 4);
    pdf.text(wrapped, bx + benW / 2, 237, { align: "center" });
  });

  rodape(1, 1); // Será sobrescrito no loop final

  // ─────────────────────────────────────────────────────────────────────────────
  // PÁGINA 2 — DIAGNÓSTICO COM SCORE
  // ─────────────────────────────────────────────────────────────────────────────
  novaPag();

  // Header seção
  fill(C.vermelhoEsc);
  pdf.rect(mX, y, cW, 14, "F");
  fill([100, 10, 10] as [number, number, number]);
  pdf.rect(mX, y, 4, 14, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  color(C.branco);
  pdf.text("DIAGNOSTICO ESTRATEGICO", mX + 9, y + 9.5);
  y += 20;

  // Card de score
  fill(C.cinzaCard);
  pdf.roundedRect(mX, y, cW, 38, 3, 3, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(mX, y, cW, 38, 3, 3, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  color(C.cinzaClaro);
  pdf.text("SCORE DE POTENCIAL DE EVOLUCAO", mX + 10, y + 9);

  // Barra de progresso
  const barW  = cW - 22;
  const barY  = y + 16;
  const scoreCor: [number, number, number] =
    score >= 8 ? C.verdeOk : score >= 6 ? C.amareloAlerta : C.vermelho;
  fill(C.cinzaEscuro);
  pdf.roundedRect(mX + 10, barY, barW, 7, 2, 2, "F");
  fill(scoreCor);
  pdf.roundedRect(mX + 10, barY, (barW * score) / 10, 7, 2, 2, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  color(C.branco);
  pdf.text(`${score}/10`, pw - mX - 4, barY + 6, { align: "right" });

  // Justificativa
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  color(C.cinzaClaro);
  const wrScore = pdf.splitTextToSize(scoreTxt, cW - 20);
  pdf.text(wrScore, mX + 10, y + 30);
  y += 48;

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDERS DE CONTEÚDO
  // ─────────────────────────────────────────────────────────────────────────────

  const renderSecao = (titulo: string) => {
    chk(18);
    y += 4;
    fill(C.vermelhoEsc);
    pdf.rect(mX, y, cW, 14, "F");
    fill([100, 10, 10] as [number, number, number]);
    pdf.rect(mX, y, 4, 14, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    color(C.branco);
    pdf.text(safe(titulo).toUpperCase(), mX + 9, y + 9.5);
    y += 18;
  };

  const renderSubsecao = (titulo: string) => {
    chk(16);
    y += 3;
    fill(C.vermelho);
    pdf.rect(mX, y, 3.5, 12, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    color(C.vermelho);
    pdf.text(safe(titulo), mX + 7, y + 8.5);
    stroke(C.cinzaEscuro);
    pdf.setLineWidth(0.25);
    pdf.line(mX + 7, y + 12, pw - mX, y + 12);
    y += 17;
  };

  const renderBullet = (msg: string) => {
    const limpo = safe(msg);
    if (!limpo) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 13);
    chk(wrapped.length * 5 + 4);
    fill(C.vermelho);
    pdf.circle(mX + 4, y + 2, 1.3, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    color(C.cinzaClaro);
    pdf.text(wrapped, mX + 9, y + 4);
    y += wrapped.length * 5 + 3;
  };

  const renderParagrafo = (msg: string) => {
    const limpo = safe(msg);
    if (!limpo) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 4);
    chk(wrapped.length * 5 + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    color(C.cinzaClaro);
    pdf.text(wrapped, mX + 2, y);
    y += wrapped.length * 5 + 5;
  };

  const renderDestaque = (msg: string) => {
    const limpo = safe(msg);
    if (!limpo) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 18);
    const h = Math.max(14, wrapped.length * 5 + 10);
    chk(h + 4);
    fill(C.cinzaCard);
    pdf.roundedRect(mX, y, cW, h, 2, 2, "F");
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(mX, y, cW, h, 2, 2, "S");
    fill(C.vermelho);
    pdf.roundedRect(mX, y, 4, h, 2, 2, "F");
    pdf.rect(mX + 2, y, 2, h, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    color(C.cinzaClaro);
    pdf.text(wrapped, mX + 9, y + 7);
    y += h + 5;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // PARSER DO CONTEÚDO IA
  // Suporta: # ## ### #### | bullet - | **bold** | texto normal
  // ─────────────────────────────────────────────────────────────────────────────
  const linhas = resultado.split("\n");

  linhas.forEach((rawLinha) => {
    const linha = rawLinha.trim();

    // Linha vazia
    if (!linha) {
      y += 3;
      return;
    }

    // Detecta nível do título antes de qualquer strip
    const nivel = nivelTitulo(linha);

    if (nivel >= 1) {
      const titulo = stripMd(linha);
      if (!titulo) return;
      if (nivel === 1 || nivel === 2) renderSecao(titulo);
      else renderSubsecao(titulo);
      return;
    }

    // Seção numerada: "1. TÍTULO EM MAIÚSCULAS"
    if (/^\d+\.\s+[A-Z\u00C0-\u00DD]/.test(linha)) {
      renderSecao(stripMd(linha));
      return;
    }

    // Linha de separador
    if (/^---+$/.test(linha)) {
      chk(8);
      stroke(C.cinzaEscuro);
      pdf.setLineWidth(0.3);
      pdf.line(mX, y, pw - mX, y);
      y += 7;
      return;
    }

    // Linha pipe (tabela markdown) — ignora cabeçalhos e separadores
    if (linha.startsWith("|")) {
      if (/^\|[-:\s|]+\|$/.test(linha)) return; // separador |---|
      if (/exerc[ií]cio|ser[ií]es|repeti[cç]|descanso/i.test(linha)) return; // header
      // Extrai colunas como texto
      const cols = linha.split("|").map(c => stripMd(c)).filter(Boolean);
      if (cols.length >= 2) renderBullet(cols.join("  |  "));
      return;
    }

    // Bullet / hífen
    if (/^[-•*]\s+/.test(linha)) {
      const txt = linha.replace(/^[-•*]\s+/, "");
      // Sub-propriedades de exercício (Séries:, Reps:, etc.) → destaque
      if (/^(S[eé]ries|Repeti[cç]|Descanso|Tempo):/i.test(txt)) {
        renderDestaque(stripMd(txt));
      } else {
        renderBullet(stripMd(txt));
      }
      return;
    }

    // Linha que é APENAS bold e funciona como sub-título
    if (/^\*\*[^*]+\*\*[:.]?\s*$/.test(linha)) {
      renderSubsecao(stripMd(linha).replace(/:$/, ""));
      return;
    }

    // Alerta
    if (/alerta|aten[cç][aã]o|cuidado|importante/i.test(linha) && linha.length < 160) {
      const limpo = safe(stripMd(linha).replace(/^#+\s*/, ""));
      const wrapped = pdf.splitTextToSize(limpo, cW - 26);
      const h = Math.max(16, wrapped.length * 5 + 12);
      chk(h + 5);
      fill(C.cinzaCard);
      pdf.roundedRect(mX, y, cW, h, 2, 2, "F");
      stroke(C.amareloAlerta);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(mX, y, cW, h, 2, 2, "S");
      fill(C.amareloAlerta);
      pdf.roundedRect(mX, y, 4, h, 2, 2, "F");
      pdf.rect(mX + 2, y, 2, h, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      color(C.amareloAlerta);
      pdf.text("!", mX + 9, y + h / 2 + 2);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      color(C.cinzaClaro);
      pdf.text(wrapped, mX + 18, y + 9);
      y += h + 6;
      return;
    }

    // Parágrafo normal (fallback)
    renderParagrafo(stripMd(linha));
  });

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECKLIST FINAL
  // ─────────────────────────────────────────────────────────────────────────────
  y += 8;
  chk(42);

  fill(C.cinzaCard);
  pdf.roundedRect(mX, y, cW, 38, 3, 3, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(mX, y, cW, 38, 3, 3, "S");
  fill(C.vermelhoEsc);
  pdf.roundedRect(mX, y, cW, 12, 3, 3, "F");
  pdf.rect(mX, y + 6, cW, 6, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  color(C.branco);
  pdf.text("SISTEMA DE ACOMPANHAMENTO SEMANAL", mX + 8, y + 8.5);

  const checklist = [
    "Registrar peso corporal 1x por semana",
    "Registrar as cargas dos exercicios principais",
    "Avaliar recuperacao e qualidade do sono",
    "Ajustar carga ao atingir topo da faixa de repeticoes",
  ];
  checklist.forEach((item, idx) => {
    const bx = mX + 8;
    const by = y + 18 + idx * 6;
    fill(C.verdeOk);
    pdf.circle(bx, by - 1, 1.2, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    color(C.cinzaClaro);
    pdf.text(item, bx + 4, by);
  });
  y += 44;

  // ─────────────────────────────────────────────────────────────────────────────
  // RODAPÉS EM TODAS AS PÁGINAS
  // ─────────────────────────────────────────────────────────────────────────────
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    rodape(p, totalPages);
  }

  pdf.save("Projeto90D-Plano-Personalizado.pdf");
}