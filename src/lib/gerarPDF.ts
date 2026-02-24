import jsPDF from "jspdf";

const LOGO_BASE64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/...";

// ─── PALETA ───────────────────────────────────────────────
const C = {
  preto: [0, 0, 0] as [number, number, number],
  vermelho: [220, 38, 38] as [number, number, number],
  vermelhoEsc: [150, 20, 20] as [number, number, number],
  vermelhoMid: [180, 28, 28] as [number, number, number],
  branco: [255, 255, 255] as [number, number, number],
  cinzaClaro: [200, 200, 200] as [number, number, number],
  cinzaMedio: [140, 140, 140] as [number, number, number],
  cinzaEscuro: [30, 30, 30] as [number, number, number],
  cinzaCard: [22, 22, 22] as [number, number, number],
  cinzaBadge: [12, 12, 12] as [number, number, number],
  amareloAlerta: [200, 140, 0] as [number, number, number],
  verdeOk: [34, 197, 94] as [number, number, number],
};

export async function gerarPDF(
  resultado: string,
  dadosAluno: {
    idade: string;
    peso: string;
    altura: string;
    dias: string;
    objetivo: string;
    nivel: string;
  }
) {
  const pdf = new jsPDF("p", "mm", "a4");
  const pw = pdf.internal.pageSize.getWidth();
  const ph = pdf.internal.pageSize.getHeight();
  const mX = 14;
  const cW = pw - mX * 2;
  let y = 0;

  const fill = (c: [number, number, number]) => pdf.setFillColor(...c);
  const stroke = (c: [number, number, number]) => pdf.setDrawColor(...c);
  const text = (c: [number, number, number]) => pdf.setTextColor(...c);

  const fundoBase = () => {
    fill(C.preto);
    pdf.rect(0, 0, pw, ph, "F");
    fill(C.vermelho);
    pdf.rect(0, 0, pw, 2, "F");
  };

  const novaPag = () => {
    pdf.addPage();
    fundoBase();
    y = 18;
  };

  const chk = (esp: number) => {
    if (y + esp > ph - 16) novaPag();
  };

  // ───────────────────────────────────────────────
  // CÁLCULOS E SCORE INTELIGENTE
  // ───────────────────────────────────────────────

  const pesoN = Number(dadosAluno.peso);
  const altN = Number(dadosAluno.altura);
  const imc = pesoN / ((altN / 100) ** 2);

  let scoreBase = 7;

  if (imc < 18.5) scoreBase -= 1;
  if (imc > 30) scoreBase -= 2;
  if (dadosAluno.nivel === "iniciante") scoreBase += 1;
  if (dadosAluno.nivel === "avancado") scoreBase -= 1;

  const score = Math.max(4, Math.min(10, scoreBase));

  const justificativaScore =
    score >= 8
      ? "Seu perfil apresenta alto potencial de evolução muscular e resposta adaptativa eficiente."
      : score >= 6
      ? "Seu potencial é sólido, com excelente margem de progresso mediante consistência."
      : "Seu progresso exigirá foco estratégico e aderência rigorosa ao plano.";

  // ───────────────────────────────────────────────
  // CAPA
  // ───────────────────────────────────────────────

  fundoBase();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(36);
  text(C.vermelho);
  pdf.text("PROJETO 90D", pw / 2, 70, { align: "center" });

  pdf.setFontSize(10);
  text(C.cinzaMedio);
  pdf.text("PLANO ESTRATÉGICO DE TRANSFORMAÇÃO", pw / 2, 80, { align: "center" });

  // ───────────────────────────────────────────────
  // SCORE PREMIUM
  // ───────────────────────────────────────────────

  novaPag();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  text(C.vermelho);
  pdf.text("DIAGNÓSTICO ESTRATÉGICO", mX, y);
  y += 10;

  fill(C.cinzaCard);
  pdf.roundedRect(mX, y, cW, 35, 3, 3, "F");
  stroke(C.vermelho);
  pdf.roundedRect(mX, y, cW, 35, 3, 3, "S");

  pdf.setFontSize(11);
  text(C.branco);
  pdf.text("SCORE DE POTENCIAL DE EVOLUÇÃO", mX + 10, y + 8);

  const barWidth = cW - 20;
  const barY = y + 15;

  fill(C.cinzaEscuro);
  pdf.rect(mX + 10, barY, barWidth, 6, "F");

  fill(score >= 8 ? C.verdeOk : score >= 6 ? C.amareloAlerta : C.vermelho);
  pdf.rect(mX + 10, barY, (barWidth * score) / 10, 6, "F");

  pdf.setFontSize(12);
  pdf.text(`${score}/10`, mX + cW - 15, barY + 5, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  const wrappedScore = pdf.splitTextToSize(justificativaScore, cW - 20);
  pdf.text(wrappedScore, mX + 10, y + 28);

  y += 45;

  // ───────────────────────────────────────────────
  // PERIODIZAÇÃO VISUAL
  // ───────────────────────────────────────────────

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  text(C.vermelho);
  pdf.text("PERIODIZAÇÃO ESTRATÉGICA – 90 DIAS", mX, y);
  y += 8;

  const fases = [
    "FASE 1 (Semanas 1–4) – Base neural e adaptação estrutural",
    "FASE 2 (Semanas 5–8) – Intensificação e sobrecarga progressiva",
    "FASE 3 (Semanas 9–12) – Pico de performance e consolidação"
  ];

  fases.forEach(f => {
    fill(C.cinzaCard);
    pdf.roundedRect(mX, y, cW, 16, 2, 2, "F");
    fill(C.vermelhoMid);
    pdf.rect(mX, y, 5, 16, "F");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(C.branco);
    pdf.text(f, mX + 10, y + 10);

    y += 20;
  });

  y += 5;

  // ───────────────────────────────────────────────
  // CONTEÚDO GERADO PELA IA
  // ───────────────────────────────────────────────

  const linhas = resultado.split("\n");

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  text(C.cinzaClaro);

  linhas.forEach(linha => {
    const wrapped = pdf.splitTextToSize(linha.replace(/\*\*/g, ""), cW);
    chk(wrapped.length * 5 + 4);
    pdf.text(wrapped, mX, y);
    y += wrapped.length * 5 + 4;
  });

  // ───────────────────────────────────────────────
  // SISTEMA DE ACOMPANHAMENTO
  // ───────────────────────────────────────────────

  y += 10;
  chk(40);

  fill(C.cinzaCard);
  pdf.roundedRect(mX, y, cW, 35, 3, 3, "F");
  stroke(C.vermelho);
  pdf.roundedRect(mX, y, cW, 35, 3, 3, "S");

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  text(C.vermelho);
  pdf.text("SISTEMA DE ACOMPANHAMENTO SEMANAL", mX + 10, y + 8);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  text(C.cinzaClaro);

  const checklist = [
    "✔ Registrar peso corporal 1x por semana",
    "✔ Registrar cargas dos exercícios principais",
    "✔ Avaliar recuperação e qualidade do sono",
    "✔ Ajustar carga ao atingir topo da faixa de repetições"
  ];

  checklist.forEach((item, i) => {
    pdf.text(item, mX + 10, y + 16 + i * 6);
  });

  pdf.save("Projeto90D.pdf");
}