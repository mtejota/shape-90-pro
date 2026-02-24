import jsPDF from "jspdf";

// ───────────────────────────────────────────────
// SANITIZAÇÃO GLOBAL (CORREÇÃO DEFINITIVA)
// ───────────────────────────────────────────────

const limparTexto = (texto: string) => {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove acentos
    .replace(/–/g, "-")
    .replace(/—/g, "-")
    .replace(/✔/g, "-")
    .replace(/[^\x00-\x7F]/g, ""); // remove qualquer caractere inválido
};

const safe = (texto: string) => limparTexto(texto);

// ─── PALETA ─────────────────────────────────────
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
  amareloAlerta: [200, 140, 0] as [number, number, number],
  verdeOk: [34, 197, 94] as [number, number, number],
};

export async function gerarPDF(resultado: string, dadosAluno: any) {
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
  // SCORE
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
      ? "Seu perfil apresenta alto potencial de evolucao muscular."
      : score >= 6
      ? "Seu potencial e solido com excelente margem de progresso."
      : "Seu progresso exigira foco estrategico e aderencia ao plano.";

  // ───────────────────────────────────────────────
  // CAPA
  // ───────────────────────────────────────────────

  fundoBase();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(34);
  text(C.vermelho);
  pdf.text(safe("PROJETO 90D"), pw / 2, 70, { align: "center" });

  pdf.setFontSize(10);
  text(C.cinzaMedio);
  pdf.text(
    safe("PLANO ESTRATEGICO DE TRANSFORMACAO"),
    pw / 2,
    80,
    { align: "center" }
  );

  // ───────────────────────────────────────────────
  // DIAGNOSTICO
  // ───────────────────────────────────────────────

  novaPag();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(14);
  text(C.vermelho);
  pdf.text(safe("DIAGNOSTICO ESTRATEGICO"), mX, y);
  y += 10;

  fill(C.cinzaCard);
  pdf.roundedRect(mX, y, cW, 35, 3, 3, "F");
  stroke(C.vermelho);
  pdf.roundedRect(mX, y, cW, 35, 3, 3, "S");

  pdf.setFontSize(11);
  text(C.branco);
  pdf.text(
    safe("SCORE DE POTENCIAL DE EVOLUCAO"),
    mX + 10,
    y + 8
  );

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
  const wrappedScore = pdf.splitTextToSize(
    safe(justificativaScore),
    cW - 20
  );
  pdf.text(wrappedScore, mX + 10, y + 28);

  y += 45;

  // ───────────────────────────────────────────────
  // CONTEUDO IA
  // ───────────────────────────────────────────────

  const linhas = safe(resultado).split("\n");

linhas.forEach((linha) => {
  const textoLimpo = linha.replace(/\*\*/g, "").trim();

  if (!textoLimpo) {
    y += 4;
    return;
  }

  // TITULO NIVEL 1 (###)
  if (textoLimpo.startsWith("###")) {
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    text(C.vermelho);
    pdf.text(textoLimpo.replace("###", "").trim(), mX, y);
    y += 8;
    return;
  }

  // TITULO NIVEL 2 (##)
  if (textoLimpo.startsWith("##")) {
    y += 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    text(C.branco);
    pdf.text(textoLimpo.replace("##", "").trim(), mX, y);
    y += 7;
    return;
  }

  // BULLET
  if (textoLimpo.startsWith("-")) {
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    text(C.cinzaClaro);

    const conteudo = textoLimpo.replace("-", "•");
    const wrapped = pdf.splitTextToSize(conteudo, cW - 5);

    chk(wrapped.length * 5 + 4);
    pdf.text(wrapped, mX + 4, y);
    y += wrapped.length * 5 + 4;
    return;
  }

  // TEXTO NORMAL
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  text(C.cinzaClaro);

  const wrapped = pdf.splitTextToSize(textoLimpo, cW);
  chk(wrapped.length * 5 + 4);
  pdf.text(wrapped, mX, y);
  y += wrapped.length * 5 + 4;
});

  // ───────────────────────────────────────────────
  // CHECKLIST
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
  pdf.text(
    safe("SISTEMA DE ACOMPANHAMENTO SEMANAL"),
    mX + 10,
    y + 8
  );

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  text(C.cinzaClaro);

  const checklist = [
    "- Registrar peso corporal 1x por semana",
    "- Registrar cargas dos exercicios principais",
    "- Avaliar recuperacao e qualidade do sono",
    "- Ajustar carga ao atingir topo da faixa de repeticoes",
  ];

  checklist.forEach((item, i) => {
    pdf.text(safe(item), mX + 10, y + 16 + i * 6);
  });

  pdf.save("Projeto90D.pdf");
}