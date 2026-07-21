import { jsPDF } from "jspdf";

/**
 * Gera e descarrega um PDF simples com os dados da encomenda — pensado
 * para imprimir e colar na embalagem (morada, artigos, referência).
 */
export function generateOrderPdf(order, storeName = "Trendout") {
  const doc = new jsPDF({ unit: "mm", format: "a5" }); // A5 já chega, poupa papel numa etiqueta
  const marginX = 14;
  let y = 18;

  // Cabeçalho
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(storeName, marginX, y);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(order.orderNumber, doc.internal.pageSize.getWidth() - marginX, y, { align: "right" });
  y += 4;
  doc.setDrawColor(200);
  doc.line(marginX, y, doc.internal.pageSize.getWidth() - marginX, y);
  y += 8;

  // Morada de entrega
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Entregar a:", marginX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const shipping = order.shipping;
  if (shipping) {
    doc.text(shipping.fullName || "", marginX, y); y += 5.5;
    doc.text(shipping.address || "", marginX, y); y += 5.5;
    doc.text(`${shipping.postalCode || ""} ${shipping.city || ""}`, marginX, y); y += 5.5;
    doc.text(shipping.country || "", marginX, y); y += 5.5;
    if (shipping.phone) { doc.text(shipping.phone, marginX, y); y += 5.5; }
  } else {
    doc.text("Sem morada registada", marginX, y);
    y += 5.5;
  }
  y += 4;

  doc.line(marginX, y, doc.internal.pageSize.getWidth() - marginX, y);
  y += 8;

  // Artigos
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Artigos:", marginX, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  (order.items || []).forEach((it) => {
    const label = `${it.quantity}x  ${it.productName}${it.size ? ` — ${it.size}` : ""}${it.color ? ` (${it.color})` : ""}`;
    const lines = doc.splitTextToSize(label, doc.internal.pageSize.getWidth() - marginX * 2 - 20);
    doc.text(lines, marginX, y);
    doc.text(`€${Number(it.lineTotal).toFixed(2)}`, doc.internal.pageSize.getWidth() - marginX, y, { align: "right" });
    y += lines.length * 5 + 2;
  });

  y += 2;
  doc.line(marginX, y, doc.internal.pageSize.getWidth() - marginX, y);
  y += 8;

  // Totais e pagamento
  doc.setFontSize(11);
  doc.text("Total", marginX, y);
  doc.setFont("helvetica", "bold");
  doc.text(`€${Number(order.total).toFixed(2)}`, doc.internal.pageSize.getWidth() - marginX, y, { align: "right" });
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(
    order.paymentMethod === "card" ? `Pago com cartão •••• ${order.cardLast4 || "----"}` : order.paymentMethod === "mbway" ? "Pago por MB WAY" : "Pago por transferência bancária",
    marginX,
    y
  );
  y += 5;
  if (order.couponCode) {
    doc.text(`Cupão aplicado: ${order.couponCode}`, marginX, y);
    y += 5;
  }

  doc.save(`${order.orderNumber}.pdf`);
}
