import jsPDF from "jspdf";

const LOGO_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/..."; // (mantém o mesmo base64 original)

// ─── PALETA ───────────────────────────────────────────────────────────────────
const C = {
  preto:         [0,   0,   0]   as [number,number,number],
  vermelho:      [220, 38,  38]  as [number,number,number],
  vermelhoEsc:   [150, 20,  20]  as [number,number,number],
  vermelhoMid:   [180, 28,  28]  as [number,number,number],
  branco:        [255, 255, 255] as [number,number,number],
  cinzaF:        [245, 245, 245] as [number,number,number],
  cinzaClaro:    [200, 200, 200] as [number,number,number],
  cinzaMedio:    [140, 140, 140] as [number,number,number],
  cinzaEscuro:   [30,  30,  30]  as [number,number,number],
  cinzaCard:     [22,  22,  22]  as [number,number,number],
  cinzaBadge:    [12,  12,  12]  as [number,number,number],
  azulAlerta:    [30,  80,  160] as [number,number,number],
  amareloAlerta: [200, 140, 0]   as [number,number,number],
};

export async function gerarPDF(
  resultado: string,
  dadosAluno: {
    idade: string; peso: string; altura: string;
    dias: string; objetivo: string; nivel: string;
  }
) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pw  = pdf.internal.pageSize.getWidth();   // 210mm
  const ph  = pdf.internal.pageSize.getHeight();  // 297mm
  const mX  = 14;
  const cW  = pw - mX * 2;
  let   y   = 0;
  let   pag = 1;

  // ─── UTILITÁRIOS ────────────────────────────────────────────────────────────

  const fill  = (c: [number,number,number]) => pdf.setFillColor(...c);
  const stroke= (c: [number,number,number]) => pdf.setDrawColor(...c);
  const text  = (c: [number,number,number]) => pdf.setTextColor(...c);

  const fundoBase = () => {
    fill(C.preto);
    pdf.rect(0, 0, pw, ph, "F");
    // Linha vermelha no topo
    fill(C.vermelho);
    pdf.rect(0, 0, pw, 2, "F");
  };

  const rodape = (num: number, total?: number) => {
    // Linha separadora
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.3);
    pdf.line(mX, ph - 10, pw - mX, ph - 10);
    // Branding esquerda
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    text(C.vermelho);
    pdf.text("PROJETO 90D", mX, ph - 5);
    // Data centro
    pdf.setFont("helvetica", "normal");
    text(C.cinzaMedio);
    const hoje = new Date().toLocaleDateString("pt-BR");
    pdf.text(hoje, pw / 2, ph - 5, { align: "center" });
    // Número página direita
    pdf.setFont("helvetica", "bold");
    text(C.cinzaMedio);
    const pStr = total ? `${num} / ${total}` : `${num}`;
    pdf.text(pStr, pw - mX, ph - 5, { align: "right" });
  };

  const novaPag = () => {
    pdf.addPage();
    pag++;
    fundoBase();
    y = 18;
  };

  const chk = (esp: number) => {
    if (y + esp > ph - 16) novaPag();
  };

  // ─── CAPA ────────────────────────────────────────────────────────────────────
  fundoBase();

  // Bloco de cor no topo da capa
  fill(C.vermelhoEsc);
  pdf.rect(0, 0, pw, 72, "F");
  fill(C.preto);
  pdf.rect(0, 18, pw, 54, "F");

  // Logo
  try {
    pdf.addImage(`data:image/jpeg;base64,${LOGO_BASE64}`, "JPEG", pw / 2 - 22, 13, 44, 44);
  } catch (_) {}

  // Título
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(34);
  text(C.vermelho);
  pdf.text("PROJETO 90D", pw / 2, 72, { align: "center" });

  // Subtítulo
  pdf.setFontSize(11);
  pdf.setFont("helvetica", "normal");
  text(C.cinzaClaro);
  pdf.text("PLANO DE TREINAMENTO PERSONALIZADO", pw / 2, 80, { align: "center" });

  // Linha divisória
  stroke(C.vermelho);
  pdf.setLineWidth(0.7);
  pdf.line(mX + 25, 85, pw - mX - 25, 85);

  // ─── CARD de dados do aluno ──────────────────────────────────────────────────
  fill(C.cinzaCard);
  pdf.roundedRect(mX, 92, cW, 70, 3, 3, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.roundedRect(mX, 92, cW, 70, 3, 3, "S");

  // Título do card com faixa
  fill(C.vermelhoEsc);
  pdf.roundedRect(mX, 92, cW, 12, 3, 3, "F");
  fill(C.vermelhoEsc);
  pdf.rect(mX, 98, cW, 6, "F"); // cancela borda inferior arredondada
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  text(C.branco);
  pdf.text("DADOS DO ALUNO", mX + 8, 100);

  // Linha abaixo do título
  stroke(C.vermelhoEsc);
  pdf.setLineWidth(0.3);
  pdf.line(mX + 6, 104, pw - mX - 6, 104);

  const objetivo = dadosAluno.objetivo === "hipertrofia" ? "Hipertrofia" :
                   dadosAluno.objetivo === "definicao"   ? "Definição"   : "Recomposição";
  const nivel    = dadosAluno.nivel === "iniciante"     ? "Iniciante"     :
                   dadosAluno.nivel === "intermediario" ? "Intermediário" : "Avançado";
  const pesoN    = Number(String(dadosAluno.peso).replace(",", "."));
  const altN     = Number(String(dadosAluno.altura).replace(",", "."));
  const imc      = (pesoN / ((altN / 100) ** 2)).toFixed(1);
  const imcClasse= Number(imc) < 18.5 ? "Abaixo do peso" :
                   Number(imc) < 25   ? "Peso normal"    :
                   Number(imc) < 30   ? "Sobrepeso"      : "Obesidade";

  // 6 métricas em grid 3x2
  const metricas = [
    { label: "IDADE",       valor: `${dadosAluno.idade} anos` },
    { label: "OBJETIVO",    valor: objetivo },
    { label: "PESO",        valor: `${dadosAluno.peso} kg` },
    { label: "NÍVEL",       valor: nivel },
    { label: "ALTURA",      valor: `${dadosAluno.altura} cm` },
    { label: "DIAS/SEMANA", valor: `${dadosAluno.dias} dias` },
    { label: "IMC",         valor: `${imc} — ${imcClasse}` },
  ];

  const cols = 3;
  const cardW = (cW - 12) / cols;
  metricas.forEach((m, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const bx  = mX + 4 + col * (cardW + 2);
    const by  = 107 + row * 18;
    fill(C.cinzaBadge);
    pdf.roundedRect(bx, by, cardW, 14, 1.5, 1.5, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(6.5);
    text(C.cinzaMedio);
    pdf.text(m.label, bx + cardW / 2, by + 5, { align: "center" });
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    text(C.branco);
    pdf.text(m.valor, bx + cardW / 2, by + 11, { align: "center" });
  });

  // Data de geração
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(7.5);
  text(C.cinzaMedio);
  const hoje = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
  pdf.text(`Gerado em ${hoje}`, pw / 2, 170, { align: "center" });

  // Frase motivacional
  fill(C.vermelhoEsc);
  pdf.rect(mX, 177, cW, 16, "F");
  stroke(C.vermelho);
  pdf.setLineWidth(0.5);
  pdf.rect(mX, 177, cW, 16, "S");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  text(C.branco);
  pdf.text('"90 DIAS PODEM MUDAR O SEU CORPO PARA SEMPRE."', pw / 2, 187, { align: "center" });

  rodape(1);

  // ─── PROCESSAMENTO DO CONTEÚDO ──────────────────────────────────────────────
  novaPag();

  /**
   * Mini parser de markdown simplificado para o formato gerado pelo Claude.
   * Detecta padrões específicos: títulos, dias da semana, exercícios,
   * listas, parágrafos, separadores.
   */

  // Normaliza o conteúdo em blocos semânticos
  const linhas = resultado.split("\n");
  let i = 0;

  // ── Helpers de render ──────────────────────────────────────────────────────

  /** Header de seção principal — fundo vermelho escuro, texto branco */
  const renderSecao = (titulo: string) => {
    chk(16);
    fill(C.vermelhoEsc);
    pdf.rect(mX, y - 1, cW, 13, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    text(C.branco);
    pdf.text(titulo.toUpperCase(), mX + 5, y + 8);
    y += 16;
  };

  /** Sub-header — linha vermelha lateral + texto */
  const renderSubsecao = (titulo: string) => {
    chk(14);
    fill(C.vermelho);
    pdf.rect(mX, y - 1, 3.5, 11, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    text(C.vermelho);
    pdf.text(titulo, mX + 7, y + 7);
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.25);
    pdf.line(mX + 7, y + 9, pw - mX, y + 9);
    y += 14;
  };

  /** Card de DIA DA SEMANA */
  const renderDia = (titulo: string) => {
    chk(18);
    fill(C.vermelhoMid);
    pdf.roundedRect(mX, y, cW, 13, 2, 2, "F");
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    text(C.branco);
    pdf.text(titulo.replace(/\*\*/g, ""), mX + 5, y + 9);
    y += 17;
  };

  /** Tabela de exercícios — header + linhas */
  interface Exercicio { nome: string; series: string; reps: string; descanso: string }
  const renderTabelaExercicios = (exercicios: Exercicio[]) => {
    if (!exercicios.length) return;
    const colW = [cW * 0.40, cW * 0.18, cW * 0.22, cW * 0.20];
    const cols_  = ["EXERCÍCIO", "SÉRIES", "REPS", "DESCANSO"];

    chk(10 + exercicios.length * 10 + 4);

    // Header da tabela
    fill(C.cinzaEscuro);
    pdf.rect(mX, y, cW, 9, "F");
    let cx = mX;
    cols_.forEach((c, idx) => {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.5);
      text(C.vermelho);
      const align = idx === 0 ? "left" : "center";
      const tx = idx === 0 ? cx + 3 : cx + colW[idx] / 2;
      pdf.text(c, tx, y + 6, { align });
      cx += colW[idx];
    });
    y += 9;

    // Linhas de exercícios
    exercicios.forEach((ex, exIdx) => {
      chk(10);
      const bg: [number,number,number] = exIdx % 2 === 0 ? C.cinzaCard : C.cinzaBadge;
      fill(bg);
      pdf.rect(mX, y, cW, 9, "F");

      // Borda esquerda vermelha
      fill(C.vermelho);
      pdf.rect(mX, y, 2, 9, "F");

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      text(C.branco);
      pdf.text(ex.nome, mX + 5, y + 6.2);

      const vals = [ex.series, ex.reps, ex.descanso];
      let vx = mX + colW[0];
      vals.forEach((v, vi) => {
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(8);
        text(vi === 0 ? C.vermelho : C.cinzaClaro);
        pdf.text(v, vx + colW[vi + 1] / 2, y + 6.2, { align: "center" });
        vx += colW[vi + 1];
      });
      y += 9;
    });

    // Linha separadora final
    stroke(C.vermelhoEsc);
    pdf.setLineWidth(0.3);
    pdf.line(mX, y, pw - mX, y);
    y += 5;
  };

  /** 3 cards de projeção — Mês 1, 2, 3 */
  const renderProjecao = (textos: string[]) => {
    chk(50);
    const cardW3 = (cW - 8) / 3;
    const titulos = ["MÊS 1", "MÊS 2", "MÊS 3"];
    const icones  = ["🔥", "💪", "🏆"];
    titulos.forEach((t, idx) => {
      const bx = mX + idx * (cardW3 + 4);
      fill(C.cinzaCard);
      pdf.roundedRect(bx, y, cardW3, 42, 2, 2, "F");
      stroke(idx === 2 ? C.vermelho : C.cinzaEscuro);
      pdf.setLineWidth(0.5);
      pdf.roundedRect(bx, y, cardW3, 42, 2, 2, "S");
      // Topo colorido
      fill(idx === 2 ? C.vermelho : C.vermelhoEsc);
      pdf.roundedRect(bx, y, cardW3, 11, 2, 2, "F");
      pdf.rect(bx, y + 5, cardW3, 6, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      text(C.branco);
      pdf.text(`${icones[idx]} ${t}`, bx + cardW3 / 2, y + 8, { align: "center" });

      // Texto do mês
      const txt = textos[idx] || "";
      const wrapped = pdf.splitTextToSize(txt, cardW3 - 6);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      text(C.cinzaClaro);
      pdf.text(wrapped.slice(0, 4), bx + 4, y + 17);
    });
    y += 46;
  };

  /** Warning box — ícone ⚠ + texto */
  const renderAlerta = (texto: string) => {
    const wrapped = pdf.splitTextToSize(texto, cW - 24);
    const h = Math.max(16, wrapped.length * 5 + 10);
    chk(h + 4);
    fill(C.cinzaCard);
    pdf.roundedRect(mX, y, cW, h, 2, 2, "F");
    stroke(C.amareloAlerta);
    pdf.setLineWidth(0.5);
    pdf.roundedRect(mX, y, cW, h, 2, 2, "S");
    // Faixa lateral amarela
    fill(C.amareloAlerta);
    pdf.roundedRect(mX, y, 4, h, 2, 2, "F");
    pdf.rect(mX + 2, y, 2, h, "F");
    // Ícone
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    text(C.amareloAlerta);
    pdf.text("⚠", mX + 8, y + h / 2 + 2);
    // Texto
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8.5);
    text(C.cinzaClaro);
    pdf.text(wrapped, mX + 18, y + 8);
    y += h + 5;
  };

  /** Cards de nutrição — 4 categorias */
  interface NutriCard { icone: string; titulo: string; texto: string }
  const renderNutricao = (cards: NutriCard[]) => {
    cards.forEach((card) => {
      const wrapped = pdf.splitTextToSize(card.texto, cW - 24);
      const h = Math.max(16, wrapped.length * 5 + 10);
      chk(h + 4);
      fill(C.cinzaCard);
      pdf.roundedRect(mX, y, cW, h, 2, 2, "F");
      stroke(C.vermelhoEsc);
      pdf.setLineWidth(0.4);
      pdf.roundedRect(mX, y, cW, h, 2, 2, "S");
      // Faixa lateral vermelha
      fill(C.vermelho);
      pdf.roundedRect(mX, y, 4, h, 2, 2, "F");
      pdf.rect(mX + 2, y, 2, h, "F");
      // Ícone + Título
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      text(C.vermelho);
      pdf.text(`${card.icone} ${card.titulo}`, mX + 9, y + 7);
      // Texto
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      text(C.cinzaClaro);
      pdf.text(wrapped, mX + 9, y + 13);
      y += h + 4;
    });
  };

  /** Item de lista simples */
  const renderBullet = (texto: string) => {
    const limpo = texto.replace(/\*\*/g, "");
    const wrapped = pdf.splitTextToSize(limpo, cW - 12);
    chk(wrapped.length * 5 + 4);
    fill(C.vermelho);
    pdf.circle(mX + 4, y + 1.5, 1.2, "F");
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(C.cinzaClaro);
    pdf.text(wrapped, mX + 8, y + 3);
    y += wrapped.length * 5 + 2;
  };

  /** Parágrafo normal */
  const renderParagrafo = (texto: string) => {
    const limpo = texto.replace(/\*\*/g, "");
    if (!limpo.trim()) return;
    const wrapped = pdf.splitTextToSize(limpo, cW - 4);
    chk(wrapped.length * 5 + 4);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(C.cinzaClaro);
    pdf.text(wrapped, mX + 2, y);
    y += wrapped.length * 5 + 4;
  };

  // ─── LOOP PRINCIPAL DE PARSING ─────────────────────────────────────────────

  // Coletor de exercícios para a tabela
  let exerciciosBuffer: Exercicio[] = [];

  const flushExercicios = () => {
    if (exerciciosBuffer.length > 0) {
      renderTabelaExercicios(exerciciosBuffer);
      exerciciosBuffer = [];
    }
  };

  while (i < linhas.length) {
    const raw   = linhas[i];
    const linha = raw.trim();

    // Título principal # ou ##
    if (linha.startsWith("# ") || linha.startsWith("## ")) {
      flushExercicios();
      renderSecao(linha.replace(/^#{1,2}\s+/, "").replace(/\*\*/g, ""));
      i++; continue;
    }

    // Sub-seção ### ou ####
    if (linha.startsWith("### ") || linha.startsWith("#### ")) {
      flushExercicios();
      renderSubsecao(linha.replace(/^#{3,4}\s+/, "").replace(/\*\*/g, ""));
      i++; continue;
    }

    // Seção numerada tipo "1. TÍTULO" (letras maiúsculas ou acento)
    if (/^\d+\.\s+[A-ZÁÉÍÓÚÀÂÃÊÔ]/.test(linha)) {
      flushExercicios();
      renderSecao(linha.replace(/\*\*/g, ""));
      i++; continue;
    }

    // Dia da semana
    if (/^(segunda|terça|quarta|quinta|sexta|sábado|domingo)[-–:]/i.test(linha)) {
      flushExercicios();
      renderDia(linha);
      i++; continue;
    }

    // Aquecimento / cardio em negrito (linha entre dias e exercícios)
    if (/^\*\*(aquecimento|cardio|obs|nota):?\*\*/i.test(linha)) {
      flushExercicios();
      const txt = linha.replace(/\*\*/g, "");
      chk(10);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8.5);
      text(C.cinzaMedio);
      pdf.text(`  ► ${txt}`, mX + 2, y);
      y += 7;
      i++; continue;
    }

    // Exercício com padrão "N. Nome: X séries de Y reps, Zseg descanso"
    const matchExNum = linha.match(/^\d+\.\s+(.+?):\s*(\d+)\s+séries?\s+de\s+(\d+[-–]\d+|\d+)\s+(?:rep\w*|execuções?).*?(?:,?\s*(\d+)s?\s*(?:de\s*)?descanso)?/i);
    if (matchExNum) {
      const [, nome, series, reps, desc] = matchExNum;
      exerciciosBuffer.push({ nome: nome.trim(), series, reps, descanso: desc ? `${desc}s` : "-" });
      i++; continue;
    }

    // Exercício em negrito + próximas linhas com props (formato anterior)
    if (linha.startsWith("**") && linha.endsWith("**") && !linha.includes(": ")) {
      flushExercicios();
      const nome = linha.replace(/\*\*/g, "");
      const props: { label: string; valor: string }[] = [];
      let j = i + 1;
      while (j < linhas.length) {
        const sub = linhas[j].trim();
        const mProp = sub.match(/^[-•]\s*(Séries|Repetições|Reps|Descanso|Tempo):\s*(.+)/i);
        if (mProp) { props.push({ label: mProp[1], valor: mProp[2] }); j++; }
        else break;
      }
      const series   = props.find(p => /séries/i.test(p.label))?.valor   || "-";
      const reps_    = props.find(p => /rep/i.test(p.label))?.valor       || "-";
      const descanso = props.find(p => /descanso|tempo/i.test(p.label))?.valor || "-";
      exerciciosBuffer.push({ nome, series, reps: reps_, descanso });
      i = j; continue;
    }

    // Bullet com exercício inline: "• Nome — X séries de Y reps (Zs)"
    if ((linha.startsWith("• ") || linha.startsWith("- ")) && !linha.match(/^[-•]\s*(Séries|Rep\w*|Descanso|Tempo):/i)) {
      const txt = linha.replace(/^[•\-]\s+/, "").replace(/\*\*/g, "");
      const matchEx = txt.match(/^(.+?)\s*[-–]\s*(\d+)\s+séries?\s+de\s+(\d+[-–]\d+|\d+)\s*(?:rep\w*)?.*?(?:\((\d+)s?\s*(?:de\s*)?descanso\))?/i);
      if (matchEx) {
        const [, nome, series, reps, desc] = matchEx;
        exerciciosBuffer.push({ nome: nome.trim(), series, reps, descanso: desc ? `${desc}s` : "-" });
        i++; continue;
      }
      flushExercicios();
      renderBullet(txt);
      i++; continue;
    }

    // Separador
    if (linha === "---") {
      flushExercicios();
      chk(6);
      stroke(C.vermelhoEsc);
      pdf.setLineWidth(0.35);
      pdf.line(mX, y, pw - mX, y);
      y += 6;
      i++; continue;
    }

    // Linha vazia
    if (linha === "") {
      flushExercicios();
      y += 3;
      i++; continue;
    }

    // Alerta / aviso de saúde
    if (/alerta|aten[çc][ãa]o|cuidado|importante/i.test(linha) && linha.length < 120) {
      flushExercicios();
      renderAlerta(linha.replace(/\*\*/g, "").replace(/#+\s*/, ""));
      i++; continue;
    }

    // Parágrafo normal
    flushExercicios();
    renderParagrafo(linha);
    i++;
  }

  flushExercicios();

  // ─── RODAPÉS EM TODAS AS PÁGINAS ─────────────────────────────────────────────
  const totalPages = (pdf.internal as any).getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    rodape(p, totalPages);
  }

  pdf.save("Projeto90D-Plano-Personalizado.pdf");
}