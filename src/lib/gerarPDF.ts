import jsPDF from "jspdf";

// ─────────────────────────────────────────────────────────────────────────────
// SANITIZAÇÃO
// ─────────────────────────────────────────────────────────────────────────────
const safe = (texto: string): string =>
  texto
    .replace(/[–—]/g, "-")
    .replace(/[^\u0000-\u00FF]/g, "")
    .replace(/\*{1,2}/g, "")
    .replace(/#{1,6}\s*/g, "")
    .trim();

const stripMd = (linha: string): string =>
  linha
    .replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1")
    .replace(/\*{1,3}/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*#{1,6}\s+/, "")
    .replace(/[–—]/g, "-")
    .replace(/[^\u0000-\u00FF]/g, "")
    .trim();

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
// LABELS COM ACENTOS CORRETOS
// ─────────────────────────────────────────────────────────────────────────────
const OBJETIVO_LABEL: Record<string, string> = {
  hipertrofia:   "Hipertrofia",
  definicao:     "Definição",
  emagrecimento: "Emagrecimento",
};

const NIVEL_LABEL: Record<string, string> = {
  iniciante:     "Iniciante",
  intermediario: "Intermediário",
  avancado:      "Avançado",
};

const LOCAL_LABEL: Record<string, string> = {
  academia:         "Academia",
  casa:             "Em casa",
  sem_equipamento:  "Sem equipamento",
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export async function gerarPDF(resultado: string, dadosAluno: Record<string, string>) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pw  = pdf.internal.pageSize.getWidth();
  const ph  = pdf.internal.pageSize.getHeight();
  const mX  = 14;
  const cW  = pw - mX * 2;
  let   y   = 0;

  const fill   = (c: [number, number, number]) => pdf.setFillColor(...c);
  const stroke = (c: [number, number, number]) => pdf.setDrawColor(...c);
  const color  = (c: [number, number, number]) => pdf.setTextColor(...c);

  const fundoBase = () => {
    fill(C.preto);
    pdf.rect(0, 0, pw, ph, "F");
    fill(C.vermelho);
    pdf.rect(0, 0, pw, 2, "F");
  };

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

  const novaPag = () => {
    pdf.addPage();
    fundoBase();
    y = 18;
  };

  const chk = (esp: number) => {
    if (y + esp > ph - 16) novaPag();
  };

  // ─── Dados calculados ──────────────────────────────────────────────────────
  const pesoN   = Number(String(dadosAluno.peso).replace(",", "."));
  const altN    = Number(String(dadosAluno.altura).replace(",", "."));
  const imcVal  = (pesoN / ((altN / 100) ** 2)).toFixed(1);
  const imcCls  = Number(imcVal) < 18.5 ? "Abaixo do peso" :
                  Number(imcVal) < 25   ? "Peso normal"    :
                  Number(imcVal) < 30   ? "Sobrepeso"      : "Obesidade";

  const objLabel  = OBJETIVO_LABEL[dadosAluno.objetivo]  ?? dadosAluno.objetivo;
  const nivLabel  = NIVEL_LABEL[dadosAluno.nivel]        ?? dadosAluno.nivel;
  const locLabel  = LOCAL_LABEL[dadosAluno.local]        ?? dadosAluno.local ?? "";

  // ─────────────────────────────────────────────────────────────────────────────
  // CAPA
  // ─────────────────────────────────────────────────────────────────────────────
  fundoBase();

  fill(C.vermelhoEsc);
  pdf.rect(0, 0, pw, 68, "F");
  fill(C.preto);
  pdf.rect(0, 16, pw, 52, "F");

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

  // Card dados do aluno — altura dinâmica (com linha de local)
  const cardY   = 88;
  const cardH   = 109; // +17mm vs original para comportar a linha de local
  fill(C.cinzaCard);
  pdf.roundedRect(mX, cardY, cW, cardH, 3, 3, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(mX, cardY, cW, cardH, 3, 3, "S");

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

  // 6 badges 3x2
  const metricas = [
    { label: "IDADE",       valor: `${dadosAluno.idade} anos` },
    { label: "OBJETIVO",    valor: objLabel },
    { label: "PESO",        valor: `${dadosAluno.peso} kg` },
    { label: "NÍVEL",       valor: nivLabel },
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

  // Badge LOCAL DE TREINO — full width
  const localBadgeY = cardY + 17 + 2 * 19;
  fill(C.cinzaBadge);
  pdf.roundedRect(mX + 3, localBadgeY, cW - 6, 15, 2, 2, "F");
  fill(C.vermelhoMid);
  pdf.roundedRect(mX + 3, localBadgeY, 4, 15, 2, 2, "F");
  pdf.rect(mX + 5, localBadgeY, 2, 15, "F");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  color(C.cinzaMedio);
  pdf.text("LOCAL DE TREINO", mX + 12, localBadgeY + 5.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  color(C.branco);
  pdf.text(safe(locLabel), mX + 12, localBadgeY + 12);

  // Badge IMC com cor indicativa
  const imcY = localBadgeY + 17;
  fill(C.cinzaBadge);
  pdf.roundedRect(mX + 3, imcY, cW - 6, 15, 2, 2, "F");
  const imcCor: [number, number, number] =
    Number(imcVal) < 18.5 ? C.amareloAlerta :
    Number(imcVal) < 25   ? C.verdeOk       :
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

  // Data (+17 em relação ao original)
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  color(C.cinzaMedio);
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  pdf.text(safe(`Gerado em ${dataHoje}`), pw / 2, 209, { align: "center" });

  // Frase motivacional
  fill(C.vermelhoEsc);
  pdf.rect(mX, 214, cW, 20, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.rect(mX, 214, cW, 20, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10.5);
  color(C.branco);
  pdf.text('"90 DIAS PODEM MUDAR O SEU CORPO PARA SEMPRE."', pw / 2, 226, { align: "center" });

  // Badges de benefícios
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
    pdf.roundedRect(bx, 239, benW, 20, 2, 2, "F");
    stroke(C.verdeOk);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(bx, 239, benW, 20, 2, 2, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    color(C.verdeOk);
    pdf.text(b.icone, bx + benW / 2, 248, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    color(C.cinzaClaro);
    const wrapped = pdf.splitTextToSize(b.txt, benW - 4);
    pdf.text(wrapped, bx + benW / 2, 254, { align: "center" });
  });

  rodape(1, 1); // Sobrescrito no loop final

  // ─────────────────────────────────────────────────────────────────────────────
  // CONTEÚDO DA IA — começa direto na página 2
  // ─────────────────────────────────────────────────────────────────────────────
  novaPag();

  // ─── Renderers ───────────────────────────────────────────────────────────────

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

  // Cabeçalho de dia de treino — visual diferenciado
  const renderDiaTreino = (titulo: string) => {
    chk(16);
    y += 4;
    fill(C.vermelhoMid);
    pdf.rect(mX, y, cW, 13, "F");
    fill(C.vermelho);
    pdf.rect(mX, y, 5, 13, "F");
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.3);
    pdf.rect(mX, y, cW, 13, "S");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    color(C.branco);
    pdf.text(safe(titulo).toUpperCase(), mX + 10, y + 9);
    y += 17;
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
    chk(wrapped.length * 5.5 + 4);
    fill(C.vermelho);
    pdf.circle(mX + 4, y + 2.5, 1.3, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    color(C.cinzaClaro);
    pdf.text(wrapped, mX + 9, y + 4.5);
    y += wrapped.length * 5.5 + 3;
  };

  const renderParagrafo = (msg: string) => {
    const limpo = safe(msg);
    if (!limpo) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 4);
    chk(wrapped.length * 5.5 + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    color(C.cinzaClaro);
    pdf.text(wrapped, mX + 2, y);
    y += wrapped.length * 5.5 + 5;
  };

  const renderDestaque = (msg: string) => {
    const limpo = safe(msg);
    if (!limpo) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 18);
    const h = Math.max(14, wrapped.length * 5.5 + 10);
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

  // Card unificado de exercício
  const renderExercicio = (
    nome: string,
    props: { label: string; valor: string }[],
    execucao: string
  ) => {
    const execLines = execucao
      ? pdf.splitTextToSize(safe(execucao), cW - 22)
      : [];
    const nBadgeRows = props.length > 0 ? Math.ceil(props.length / 4) : 0;
    const h =
      14 +                                            // header
      nBadgeRows * 14 +                               // badges
      (execLines.length > 0 ? execLines.length * 5.5 + 12 : 0) + // execução
      5;                                              // bottom padding

    chk(h + 4);

    // Fundo do card
    fill(C.cinzaCard);
    pdf.roundedRect(mX, y, cW, h, 2, 2, "F");
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.4);
    pdf.roundedRect(mX, y, cW, h, 2, 2, "S");

    // Header vermelho
    fill(C.vermelhoEsc);
    pdf.roundedRect(mX, y, cW, 12, 2, 2, "F");
    pdf.rect(mX, y + 6, cW, 6, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    color(C.branco);
    pdf.text(safe(nome).toUpperCase(), mX + 7, y + 8.5);

    // Badges de propriedades
    const badgeW2 = props.length > 0 ? (cW - 8) / Math.min(props.length, 4) : 0;
    props.forEach((p, i) => {
      const col  = i % 4;
      const row  = Math.floor(i / 4);
      const bx   = mX + 4 + col * badgeW2;
      const by   = y + 15 + row * 14;
      fill(C.cinzaBadge);
      pdf.roundedRect(bx, by, badgeW2 - 2, 11, 1, 1, "F");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(6);
      color(C.cinzaMedio);
      pdf.text(safe(p.label).toUpperCase(), bx + (badgeW2 - 2) / 2, by + 4, { align: "center" });
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      color(C.vermelho);
      pdf.text(safe(p.valor), bx + (badgeW2 - 2) / 2, by + 9.5, { align: "center" });
    });

    // Linha de execução
    if (execLines.length > 0) {
      const execStartY = y + 15 + nBadgeRows * 14 + 2;
      stroke(C.cinzaEscuro);
      pdf.setLineWidth(0.2);
      pdf.line(mX + 4, execStartY, pw - mX - 4, execStartY);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      color(C.cinzaMedio);
      pdf.text("EXECUCAO:", mX + 7, execStartY + 5);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      color(C.cinzaClaro);
      pdf.text(execLines, mX + 7, execStartY + 10);
    }

    y += h + 5;
  };

  // Tabela markdown
  const renderTabela = (rows: string[][]) => {
    if (rows.length === 0) return;
    const maxCols  = Math.max(...rows.map(r => r.length));
    const colW     = (cW - 4) / maxCols;

    rows.forEach((row, rowIdx) => {
      const isHeader = rowIdx === 0;
      const rowH     = 9;
      chk(rowH + 2);

      fill(isHeader ? C.vermelhoEsc : (rowIdx % 2 === 0 ? C.cinzaCard : C.cinzaBadge));
      pdf.rect(mX + 2, y, cW - 4, rowH, "F");
      stroke(C.cinzaEscuro);
      pdf.setLineWidth(0.15);
      pdf.rect(mX + 2, y, cW - 4, rowH, "S");

      row.forEach((cell, colIdx) => {
        const cx = mX + 2 + colIdx * colW;
        pdf.setFont("helvetica", isHeader ? "bold" : "normal");
        pdf.setFontSize(8);
        color(isHeader ? C.branco : C.cinzaClaro);
        const cellText = pdf.splitTextToSize(safe(cell), colW - 4);
        pdf.text(cellText[0] || "", cx + 2, y + 6.5);
      });

      y += rowH;
    });
    y += 5;
  };

  // ─── PARSER PRINCIPAL — for loop com lookahead ─────────────────────────────
  const linhas    = resultado.split("\n");
  let tabelaRows: string[][] = [];

  const flushTabela = () => {
    if (tabelaRows.length > 0) {
      renderTabela(tabelaRows);
      tabelaRows = [];
    }
  };

  for (let i = 0; i < linhas.length; i++) {
    const linha = linhas[i].trim();

    // Linha vazia
    if (!linha) {
      flushTabela();
      y += 3;
      continue;
    }

    // Separador
    if (/^---+$/.test(linha)) {
      flushTabela();
      chk(8);
      stroke(C.cinzaEscuro);
      pdf.setLineWidth(0.3);
      pdf.line(mX, y, pw - mX, y);
      y += 7;
      continue;
    }

    // Tabela markdown
    if (linha.startsWith("|")) {
      if (/^\|[-:\s|]+\|$/.test(linha)) continue; // separador |---|
      const cols = linha.split("|").map(c => stripMd(c.trim())).filter(Boolean);
      if (cols.length > 0) tabelaRows.push(cols);
      continue;
    } else {
      flushTabela();
    }

    // Títulos markdown
    const nivel = nivelTitulo(linha);
    if (nivel >= 1) {
      const titulo = stripMd(linha);
      if (!titulo) continue;
      if (nivel === 1 || nivel === 2) {
        renderSecao(titulo);
      } else {
        // Nível 3-4: detecta cabeçalho de dia de treino
        const tUpper = titulo.toUpperCase();
        const isDiaTreino = /^(TREINO\s+[A-G]|DIA\s+\d|TREINO DE\s|SESS[AÃ]O\s+[A-G\d])/.test(tUpper);
        if (isDiaTreino) {
          renderDiaTreino(titulo);
        } else {
          renderSubsecao(titulo);
        }
      }
      continue;
    }

    // Seção numerada: "1. TÍTULO EM MAIÚSCULAS"
    if (/^\d+\.\s+[A-Z\u00C0-\u00DD]/.test(linha)) {
      renderSecao(stripMd(linha));
      continue;
    }

    // Linha bold isolada — pode ser nome de exercício (com lookahead) ou subtítulo
    if (/^\*\*[^*]+\*\*[:.]?\s*$/.test(linha)) {
      const nome = stripMd(linha).replace(/:$/, "");
      const props: { label: string; valor: string }[] = [];
      let execucao = "";
      let j = i + 1;

      while (j < linhas.length) {
        const sub = linhas[j].trim();
        if (/^[-•]\s+(S[eé]ries|Repeti[cç]|Descanso|Tempo|Execu[cç][aã]o):/i.test(sub)) {
          const txt        = sub.replace(/^[-•]\s+/, "");
          const colonIdx   = txt.indexOf(":");
          const label      = txt.substring(0, colonIdx).trim();
          const valor      = txt.substring(colonIdx + 1).trim();
          if (/execu/i.test(label)) {
            execucao = valor;
          } else {
            props.push({ label, valor });
          }
          j++;
        } else {
          break;
        }
      }

      if (props.length > 0) {
        renderExercicio(nome, props, execucao);
        i = j - 1;
      } else {
        renderSubsecao(nome);
      }
      continue;
    }

    // Bullet
    if (/^[-•*]\s+/.test(linha)) {
      const txt = linha.replace(/^[-•*]\s+/, "");
      if (/^(S[eé]ries|Repeti[cç]|Descanso|Tempo|Execu[cç][aã]o):/i.test(txt)) {
        renderDestaque(stripMd(txt));
      } else {
        renderBullet(stripMd(txt));
      }
      continue;
    }

    // Alerta
    if (/alerta|aten[cç][aã]o|cuidado|importante/i.test(linha) && linha.length < 160) {
      const limpo   = safe(stripMd(linha).replace(/^#+\s*/, ""));
      const wrapped = pdf.splitTextToSize(limpo, cW - 26);
      const h       = Math.max(16, wrapped.length * 5.5 + 12);
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
      continue;
    }

    // Parágrafo normal
    renderParagrafo(stripMd(linha));
  }

  flushTabela();

  // ─────────────────────────────────────────────────────────────────────────────
  // CHECKLIST FINAL
  // ─────────────────────────────────────────────────────────────────────────────
  y += 8;
  chk(44);

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
  pdf.text("CHECKLIST SEMANAL DE ACOMPANHAMENTO", mX + 8, y + 8.5);

  const checklist = [
    "Registrar peso corporal 1x por semana (mesmo dia e horário)",
    "Anotar as cargas dos exercícios principais a cada sessão",
    "Avaliar qualidade do sono e nível de recuperação muscular",
    "Aumentar a carga ao atingir o limite superior de repetições",
  ];
  checklist.forEach((item, idx) => {
    const bx = mX + 8;
    const by = y + 18 + idx * 6;
    fill(C.verdeOk);
    pdf.circle(bx, by - 1, 1.2, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    color(C.cinzaClaro);
    pdf.text(safe(item), bx + 4, by);
  });
  y += 44;

  // ─────────────────────────────────────────────────────────────────────────────
  // RODAPÉS
  // ─────────────────────────────────────────────────────────────────────────────
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    rodape(p, totalPages);
  }

  pdf.save("Projeto90D-Plano-Personalizado.pdf");
}
