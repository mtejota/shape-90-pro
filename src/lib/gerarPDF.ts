import jsPDF from "jspdf";

const LOGO_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/..."; // (mantém o mesmo base64 original)

// ─── PALETA ───────────────────────────────────────────────────────────────────
const C = {
  preto:         [0,   0,   0]   as [number,number,number],
  vermelho:      [220, 38,  38]  as [number,number,number],
  vermelhoEsc:   [150, 20,  20]  as [number,number,number],
  vermelhoMid:   [180, 28,  28]  as [number,number,number],
  branco:        [255, 255, 255] as [number,number,number],
  cinzaClaro:    [200, 200, 200] as [number,number,number],
  cinzaMedio:    [140, 140, 140] as [number,number,number],
  cinzaEscuro:   [30,  30,  30]  as [number,number,number],
  cinzaCard:     [22,  22,  22]  as [number,number,number],
  cinzaBadge:    [12,  12,  12]  as [number,number,number],
  amareloAlerta: [200, 140, 0]   as [number,number,number],
  verdeOk:       [34,  197, 94]  as [number,number,number],
};

export async function gerarPDF(
  resultado: string,
  dadosAluno: {
    idade: string; peso: string; altura: string;
    dias: string; objetivo: string; nivel: string;
  }
) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pw  = pdf.internal.pageSize.getWidth();
  const ph  = pdf.internal.pageSize.getHeight();
  const mX  = 14;
  const cW  = pw - mX * 2;
  let   y   = 0;

  const fill   = (c: [number,number,number]) => pdf.setFillColor(...c);
  const stroke = (c: [number,number,number]) => pdf.setDrawColor(...c);
  const text   = (c: [number,number,number]) => pdf.setTextColor(...c);

  const fundoBase = () => {
    fill(C.preto);
    pdf.rect(0, 0, pw, ph, "F");
    fill(C.vermelho);
    pdf.rect(0, 0, pw, 2, "F");
  };

  const rodape = (num: number, total?: number) => {
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.3);
    pdf.line(mX, ph - 10, pw - mX, ph - 10);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    text(C.vermelho);
    pdf.text("PROJETO 90D", mX, ph - 5);
    pdf.setFont("helvetica", "normal");
    text(C.cinzaMedio);
    pdf.text(new Date().toLocaleDateString("pt-BR"), pw / 2, ph - 5, { align: "center" });
    pdf.setFont("helvetica", "bold");
    text(C.cinzaMedio);
    pdf.text(total ? `${num} / ${total}` : `${num}`, pw - mX, ph - 5, { align: "right" });
  };

  const novaPag = () => {
    pdf.addPage();
    fundoBase();
    y = 18;
  };

  const chk = (esp: number) => {
    if (y + esp > ph - 16) novaPag();
  };

  // ─── DADOS ───────────────────────────────────────────────────────────────────
  const objetivoLabel = dadosAluno.objetivo === "hipertrofia" ? "Hipertrofia" :
                        dadosAluno.objetivo === "definicao"   ? "Definição"   : "Emagrecimento";
  const nivelLabel    = dadosAluno.nivel === "iniciante"      ? "Iniciante"     :
                        dadosAluno.nivel === "intermediario"  ? "Intermediário" : "Avançado";
  const pesoN  = Number(String(dadosAluno.peso).replace(",", "."));
  const altN   = Number(String(dadosAluno.altura).replace(",", "."));
  const imcVal = (pesoN / ((altN / 100) ** 2)).toFixed(1);
  const imcCls = Number(imcVal) < 18.5 ? "Abaixo do peso" :
                 Number(imcVal) < 25   ? "Peso normal"    :
                 Number(imcVal) < 30   ? "Sobrepeso"      : "Obesidade";

  // ─── CAPA ─────────────────────────────────────────────────────────────────────
  fundoBase();

  // Faixa vermelha topo
  fill(C.vermelhoEsc);
  pdf.rect(0, 0, pw, 68, "F");
  fill(C.preto);
  pdf.rect(0, 16, pw, 52, "F");

  // Logo
  try {
    pdf.addImage(`data:image/jpeg;base64,${LOGO_BASE64}`, "JPEG", pw / 2 - 20, 11, 40, 40);
  } catch (_) {}

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(38);
  text(C.vermelho);
  pdf.text("PROJETO 90D", pw / 2, 70, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(10);
  text(C.cinzaMedio);
  pdf.text("PLANO DE TREINAMENTO PERSONALIZADO", pw / 2, 78, { align: "center" });

  stroke(C.vermelho);
  pdf.setLineWidth(0.7);
  pdf.line(mX + 20, 83, pw - mX - 20, 83);

  // ─── CARD DADOS DO ALUNO ─────────────────────────────────────────────────────
  const cardY = 88;
  fill(C.cinzaCard);
  pdf.roundedRect(mX, cardY, cW, 92, 3, 3, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(mX, cardY, cW, 92, 3, 3, "S");

  // Header do card
  fill(C.vermelhoEsc);
  pdf.roundedRect(mX, cardY, cW, 13, 3, 3, "F");
  pdf.rect(mX, cardY + 7, cW, 6, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  text(C.branco);
  pdf.text("DADOS DO ALUNO", mX + 8, cardY + 9);

  stroke(C.vermelhoEsc);
  pdf.setLineWidth(0.3);
  pdf.line(mX + 6, cardY + 13, pw - mX - 6, cardY + 13);

  // 6 badges em grid 3x2
  const metricas = [
    { label: "IDADE",       valor: `${dadosAluno.idade} anos` },
    { label: "OBJETIVO",    valor: objetivoLabel },
    { label: "PESO",        valor: `${dadosAluno.peso} kg` },
    { label: "NÍVEL",       valor: nivelLabel },
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
    text(C.cinzaMedio);
    pdf.text(m.label, bx + badgeW / 2, by + 5.5, { align: "center" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    text(C.branco);
    pdf.text(m.valor, bx + badgeW / 2, by + 12, { align: "center" });
  });

  // IMC — badge largo na base do card, com indicador de cor
  const imcY = cardY + 17 + 2 * 19;
  fill(C.cinzaBadge);
  pdf.roundedRect(mX + 3, imcY, cW - 6, 15, 2, 2, "F");
  const imcCor: [number,number,number] =
    Number(imcVal) < 18.5 ? C.amareloAlerta :
    Number(imcVal) < 25   ? C.verdeOk :
    Number(imcVal) < 30   ? C.amareloAlerta : C.vermelho;
  fill(imcCor);
  pdf.roundedRect(mX + 3, imcY, 4, 15, 2, 2, "F");
  pdf.rect(mX + 5, imcY, 2, 15, "F");
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(6.5);
  text(C.cinzaMedio);
  pdf.text("IMC", mX + 12, imcY + 5.5);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  text(C.branco);
  pdf.text(`${imcVal}  —  ${imcCls}`, mX + 12, imcY + 12);

  // Data
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  text(C.cinzaMedio);
  const dataHoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  pdf.text(`Gerado em ${dataHoje}`, pw / 2, 192, { align: "center" });

  // Frase motivacional
  fill(C.vermelhoEsc);
  pdf.rect(mX, 197, cW, 20, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.rect(mX, 197, cW, 20, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  text(C.branco);
  pdf.text('"90 DIAS PODEM MUDAR O SEU CORPO PARA SEMPRE."', pw / 2, 209, { align: "center" });

  // Benefícios visuais
  const bens = [
    { icone: "✓", txt: "Treino personalizado" },
    { icone: "✓", txt: "Progressão científica" },
    { icone: "✓", txt: "Resultados em 90 dias" },
    { icone: "✓", txt: "PDF exclusivo" },
  ];
  const benW = (cW - 6) / 4;
  bens.forEach((b, idx) => {
    const bx = mX + idx * (benW + 2);
    fill(C.cinzaCard);
    pdf.roundedRect(bx, 222, benW, 20, 2, 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    text(C.verdeOk);
    pdf.text(b.icone, bx + benW / 2, 230, { align: "center" });
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    text(C.cinzaClaro);
    const wrapped = pdf.splitTextToSize(b.txt, benW - 4);
    pdf.text(wrapped, bx + benW / 2, 236, { align: "center" });
  });

  rodape(1);

  // ─── CONTEÚDO ─────────────────────────────────────────────────────────────────
  novaPag();

  // ── Renders ──────────────────────────────────────────────────────────────────

  const renderSecao = (titulo: string) => {
    chk(18);
    y += 2;
    fill(C.vermelhoEsc);
    pdf.rect(mX, y, cW, 14, "F");
    fill([100, 10, 10] as [number,number,number]);
    pdf.rect(mX, y, 4, 14, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    text(C.branco);
    pdf.text(titulo.toUpperCase().replace(/\*\*/g, ""), mX + 9, y + 9.5);
    y += 18;
  };

  const renderSubsecao = (titulo: string) => {
    chk(15);
    y += 2;
    fill(C.vermelho);
    pdf.rect(mX, y, 3.5, 12, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    text(C.vermelho);
    pdf.text(titulo.replace(/\*\*/g, ""), mX + 7, y + 8.5);
    stroke(C.cinzaEscuro);
    pdf.setLineWidth(0.25);
    pdf.line(mX + 7, y + 12, pw - mX, y + 12);
    y += 17;
  };

  const renderDia = (titulo: string) => {
    chk(20);
    y += 3;
    fill(C.vermelhoMid);
    pdf.roundedRect(mX, y, cW, 14, 2, 2, "F");
    fill(C.vermelhoEsc);
    pdf.roundedRect(mX, y, 28, 14, 2, 2, "F");
    pdf.rect(mX + 14, y, 14, 14, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    text(C.cinzaMedio);
    pdf.text("DIA", mX + 14, y + 9.5, { align: "center" });
    pdf.setFontSize(10);
    text(C.branco);
    const nomeDia = titulo.replace(/\*\*/g, "").replace(/[-–:]\s*.*/, "").trim();
    const restoDia = titulo.replace(/\*\*/g, "").replace(/^[^-–:]+[-–:\s]+/, "").trim();
    pdf.text(nomeDia.toUpperCase(), mX + 32, y + 9.5);
    if (restoDia) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      text(C.cinzaClaro);
      pdf.text(`— ${restoDia}`, mX + 32 + pdf.getTextWidth(nomeDia.toUpperCase()) + 2, y + 9.5);
    }
    y += 18;
  };

  interface Exercicio { nome: string; series: string; reps: string; descanso: string }

  const renderTabelaExercicios = (exercicios: Exercicio[]) => {
    if (!exercicios.length) return;
    const colW = [cW * 0.42, cW * 0.17, cW * 0.21, cW * 0.20];
    chk(9 + exercicios.length * 9 + 6);

    // Header
    fill(C.cinzaEscuro);
    pdf.rect(mX, y, cW, 9, "F");
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.4);
    pdf.line(mX, y + 9, pw - mX, y + 9);
    let cx = mX;
    ["EXERCÍCIO", "SÉRIES", "REPS", "DESCANSO"].forEach((h, idx) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7);
      text(C.vermelho);
      pdf.text(h, idx === 0 ? cx + 5 : cx + colW[idx] / 2, y + 6, { align: idx === 0 ? "left" : "center" });
      cx += colW[idx];
    });
    y += 9;

    // Rows
    exercicios.forEach((ex, idx) => {
      chk(10);
      fill(idx % 2 === 0 ? C.cinzaCard : C.cinzaBadge);
      pdf.rect(mX, y, cW, 9, "F");
      fill(C.vermelho);
      pdf.rect(mX, y, 2.5, 9, "F");

      const nomeStr = pdf.splitTextToSize(ex.nome, colW[0] - 8)[0] || ex.nome;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      text(C.branco);
      pdf.text(nomeStr, mX + 6, y + 6);

      let vx = mX + colW[0];
      [ex.series, ex.reps, ex.descanso].forEach((v, vi) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        text(vi === 0 ? C.vermelho : vi === 1 ? C.cinzaClaro : C.cinzaMedio);
        pdf.text(v || "—", vx + colW[vi + 1] / 2, y + 6, { align: "center" });
        vx += colW[vi + 1];
      });
      y += 9;
    });

    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.3);
    pdf.line(mX, y, pw - mX, y);
    y += 6;
  };

  const renderAlerta = (msg: string) => {
    const wrapped = pdf.splitTextToSize(msg.replace(/\*\*/g, ""), cW - 26);
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
    text(C.amareloAlerta);
    pdf.text("!", mX + 9, y + h / 2 + 2);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    text(C.cinzaClaro);
    pdf.text(wrapped, mX + 18, y + 9);
    y += h + 6;
  };

  const renderBullet = (msg: string) => {
    const limpo = msg.replace(/\*\*/g, "");
    if (!limpo.trim()) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 13);
    chk(wrapped.length * 5 + 4);
    fill(C.vermelho);
    pdf.circle(mX + 4, y + 2, 1.3, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(C.cinzaClaro);
    pdf.text(wrapped, mX + 9, y + 4);
    y += wrapped.length * 5 + 3;
  };

  const renderParagrafo = (msg: string) => {
    const limpo = msg.replace(/\*\*/g, "");
    if (!limpo.trim()) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 4);
    chk(wrapped.length * 5 + 5);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(C.cinzaClaro);
    pdf.text(wrapped, mX + 2, y);
    y += wrapped.length * 5 + 5;
  };

  const renderConclusao = (msg: string) => {
    if (!msg.trim()) return;
    chk(32);
    y += 4;
    fill(C.cinzaCard);
    pdf.roundedRect(mX, y, cW, 28, 3, 3, "F");
    stroke(C.vermelho);
    pdf.setLineWidth(0.8);
    pdf.roundedRect(mX, y, cW, 28, 3, 3, "S");
    fill(C.vermelho);
    pdf.roundedRect(mX, y, 5, 28, 3, 3, "F");
    pdf.rect(mX + 3, y, 5, 28, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    text(C.vermelho);
    pdf.text("CONCLUSÃO", mX + 12, y + 8);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    text(C.cinzaClaro);
    const wrapped = pdf.splitTextToSize(msg, cW - 18);
    pdf.text(wrapped.slice(0, 3), mX + 12, y + 15);
    y += 34;
  };

  // ── PARSER ───────────────────────────────────────────────────────────────────

  const linhas = resultado.split("\n");
  let i = 0;
  let exerciciosBuffer: Exercicio[] = [];
  let emConclusao = false;
  let conclusaoTexto = "";

  const flushExercicios = () => {
    if (exerciciosBuffer.length > 0) {
      renderTabelaExercicios(exerciciosBuffer);
      exerciciosBuffer = [];
    }
  };

  // Detecta se pipe row é cabeçalho/separador — deve ser ignorado
  const isPipeIgnorada = (l: string) =>
    /^\|[-:\s|]+\|$/.test(l) ||                                     // |---|---|
    /exerc[ií]cio|séries|repetições|descanso/i.test(l) ||           // header labels
    /^\|\s*dia\s*\|/i.test(l) ||                                    // | Dia |
    l.replace(/[|\s\-]/g, "") === "";                               // vazia

  // Parse de linha pipe em Exercicio
  const parsePipe = (l: string): Exercicio | null => {
    const cols = l.split("|").map(c => c.trim()).filter(Boolean);
    if (cols.length < 3) return null;
    // Filtra linhas onde o "exercício" é traço ou vazio
    const candidatoNome = cols.length >= 5 ? cols[1] : cols[0];
    if (!candidatoNome || /^[-–]+$/.test(candidatoNome) || candidatoNome === "") return null;

    if (cols.length >= 5) {
      // | Dia | Exercício | Séries | Reps | Descanso |
      return { nome: cols[1], series: cols[2], reps: cols[3], descanso: cols[4] };
    }
    // | Exercício | Séries | Reps | Descanso |
    return { nome: cols[0], series: cols[1], reps: cols[2], descanso: cols[3] || "—" };
  };

  while (i < linhas.length) {
    const linha = linhas[i].trim();

    // ── Tabela pipe ─────────────────────────────────────────────────────────
    if (linha.startsWith("|") && linha.endsWith("|")) {
      if (!isPipeIgnorada(linha)) {
        const ex = parsePipe(linha);
        if (ex) exerciciosBuffer.push(ex);
      }
      i++; continue;
    }

    // ── Título # ## ──────────────────────────────────────────────────────────
    if (linha.startsWith("# ") || linha.startsWith("## ")) {
      flushExercicios();
      const titulo = linha.replace(/^#{1,2}\s+/, "").replace(/\*\*/g, "");
      if (/conclus[aã]o/i.test(titulo)) { emConclusao = true; i++; continue; }
      emConclusao = false;
      renderSecao(titulo);
      i++; continue;
    }

    // ── Sub-seção ### #### ───────────────────────────────────────────────────
    if (linha.startsWith("### ") || linha.startsWith("#### ")) {
      flushExercicios();
      const titulo = linha.replace(/^#{3,4}\s+/, "").replace(/\*\*/g, "");
      if (/conclus[aã]o/i.test(titulo)) { emConclusao = true; i++; continue; }
      emConclusao = false;
      renderSubsecao(titulo);
      i++; continue;
    }

    // ── Seção numerada "1. TÍTULO" ───────────────────────────────────────────
    if (/^\d+\.\s+[A-ZÁÉÍÓÚÀÂÃÊÔ]/.test(linha)) {
      flushExercicios();
      const titulo = linha.replace(/\*\*/g, "");
      if (/conclus[aã]o/i.test(titulo)) { emConclusao = true; i++; continue; }
      emConclusao = false;
      renderSecao(titulo);
      i++; continue;
    }

    // ── Dia da semana ────────────────────────────────────────────────────────
    if (/^(segunda|ter[cç]a|quarta|quinta|sexta|s[aá]bado|domingo)[-–:\s]/i.test(linha)) {
      flushExercicios();
      renderDia(linha);
      i++; continue;
    }

    // ── Negrito multi-linha (exercício com props) ────────────────────────────
    if (linha.startsWith("**") && linha.endsWith("**") && !linha.slice(2, -2).includes("**")) {
      const nome = linha.replace(/\*\*/g, "").trim();
      const props: { label: string; valor: string }[] = [];
      let j = i + 1;
      while (j < linhas.length) {
        const sub = linhas[j].trim();
        const m = sub.match(/^[-•]\s*(Séries|Repetições|Reps|Descanso|Tempo):\s*(.+)/i);
        if (m) { props.push({ label: m[1], valor: m[2] }); j++; }
        else break;
      }
      if (props.length > 0) {
        exerciciosBuffer.push({
          nome,
          series:   props.find(p => /séries/i.test(p.label))?.valor   || "—",
          reps:     props.find(p => /rep/i.test(p.label))?.valor       || "—",
          descanso: props.find(p => /descanso|tempo/i.test(p.label))?.valor || "—",
        });
        i = j; continue;
      }
      flushExercicios();
      renderSubsecao(nome);
      i++; continue;
    }

    // ── Exercício numerado inline ────────────────────────────────────────────
    const mExNum = linha.match(
      /^\d+\.\s+(.+?):\s*(\d+)\s+séries?\s+de\s+(\d+[-–]\d+|\d+)\s*(?:rep\w*)?.*?(?:,?\s*(\d+[-–]?\d*)s?\s*(?:de\s*)?descanso)?/i
    );
    if (mExNum) {
      const [, nome, series, reps, desc] = mExNum;
      exerciciosBuffer.push({ nome: nome.trim(), series, reps, descanso: desc ? `${desc}s` : "—" });
      i++; continue;
    }

    // ── Bullet / hífen ───────────────────────────────────────────────────────
    if (linha.startsWith("- ") || linha.startsWith("• ")) {
      const txt = linha.replace(/^[-•]\s+/, "").replace(/\*\*/g, "");
      if (/^(Séries|Repetições|Reps|Descanso|Tempo):/i.test(txt)) { i++; continue; }
      const mEx = txt.match(/^(.+?)\s*[-–]\s*(\d+)\s+séries?\s+de\s+(\d+[-–]\d+|\d+)\s*(?:rep\w*)?.*?(?:\((\d+[-–]?\d*)s?\))?/i);
      if (mEx) {
        const [, nome, series, reps, desc] = mEx;
        exerciciosBuffer.push({ nome: nome.trim(), series, reps, descanso: desc ? `${desc}s` : "—" });
        i++; continue;
      }
      flushExercicios();
      if (emConclusao) { conclusaoTexto += " " + txt; i++; continue; }
      renderBullet(txt);
      i++; continue;
    }

    // ── Cardio/aquecimento ───────────────────────────────────────────────────
    if (/^\*\*(cardio|aquecimento|obs|nota):?\*\*/i.test(linha)) {
      flushExercicios();
      chk(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      text(C.cinzaMedio);
      pdf.text(`► ${linha.replace(/\*\*/g, "")}`, mX + 4, y);
      y += 8;
      i++; continue;
    }

    // ── Separador ---  ───────────────────────────────────────────────────────
    if (linha === "---") {
      flushExercicios();
      chk(8);
      stroke(C.cinzaEscuro);
      pdf.setLineWidth(0.35);
      pdf.line(mX, y, pw - mX, y);
      y += 7;
      i++; continue;
    }

    // ── Linha vazia ──────────────────────────────────────────────────────────
    if (linha === "") {
      flushExercicios();
      if (emConclusao && conclusaoTexto.trim()) {
        renderConclusao(conclusaoTexto.trim());
        conclusaoTexto = "";
        emConclusao = false;
      }
      y += 3;
      i++; continue;
    }

    // ── Alerta ───────────────────────────────────────────────────────────────
    if (/alerta|aten[çc][ãa]o|cuidado|importante/i.test(linha) && linha.length < 150) {
      flushExercicios();
      renderAlerta(linha.replace(/^#+\s*/, ""));
      i++; continue;
    }

    // ── Fallback: parágrafo ──────────────────────────────────────────────────
    flushExercicios();
    if (emConclusao) {
      conclusaoTexto += " " + linha.replace(/\*\*/g, "");
    } else {
      renderParagrafo(linha);
    }
    i++;
  }

  // Flush final
  flushExercicios();
  if (emConclusao && conclusaoTexto.trim()) {
    renderConclusao(conclusaoTexto.trim());
  }

  // ─── RODAPÉS ─────────────────────────────────────────────────────────────────
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    rodape(p, totalPages);
  }

  pdf.save("Projeto90D-Plano-Personalizado.pdf");
}