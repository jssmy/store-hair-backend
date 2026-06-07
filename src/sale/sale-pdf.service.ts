import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument = require('pdfkit');
import { Sale } from './entities/sale.entity';
import { SaleDetail } from './entities/sale-detail.entity';
import { SalePaymentMethod } from './enums/sale-payment-method.enum';
import { SalePaymentType } from './enums/sale-payment-type.enum';
import { AppSettingsService } from 'src/app-settings/app-settings.service';
import { AppSettings } from 'src/app-settings/entities/app-settings.entity';

const PAYMENT_LABELS: Record<SalePaymentMethod, string> = {
  [SalePaymentMethod.CASH]: 'Contado',
  [SalePaymentMethod.CREDIT]: 'Crédito',
};

const COLORS = {
  primary: '#1a1a2e',
  accent: '#e94560',
  light: '#f5f5f5',
  border: '#cccccc',
  text: '#333333',
  muted: '#666666',
};

@Injectable()
export class SalePdfService {
  constructor(
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    private readonly appSettingsService: AppSettingsService,
  ) {}

  async generatePdf(id: number): Promise<Buffer> {
    const [sale, settings] = await Promise.all([
      this.saleRepository
        .createQueryBuilder('sale')
        .leftJoin('sale.customer', 'customer')
        .addSelect(['customer.id', 'customer.names', 'customer.phone', 'customer.dni'])
        .leftJoin('sale.user', 'user')
        .addSelect(['user.id', 'user.name', 'user.email'])
        .leftJoinAndSelect('sale.details', 'details')
        .leftJoinAndSelect('details.product', 'product')
        .leftJoinAndSelect('sale.payments', 'payments')
        .where('sale.id = :id', { id })
        .getOne(),
      this.appSettingsService.get(),
    ]);

    if (!sale) {
      throw new NotFoundException(`Venta con ID ${id} no encontrada`);
    }

    return this.buildPdf(sale, settings);
  }

  private buildPdf(sale: Sale, settings: AppSettings): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc, settings);
      this.drawSaleMeta(doc, sale);
      this.drawCustomerInfo(doc, sale);
      this.drawDetailsTable(doc, sale.details ?? []);
      this.drawPaymentSummary(doc, sale);
      this.drawFooter(doc, sale, settings);

      doc.end();
    });
  }

  // ─── Secciones ───────────────────────────────────────────────────────────────

  private drawHeader(doc: PDFKit.PDFDocument, settings: AppSettings) {
    doc.rect(50, 45, doc.page.width - 100, 70).fill(COLORS.primary);

    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(settings.companyName, 70, 65, { continued: false });

    doc
      .fontSize(9)
      .font('Helvetica')
      .text(settings.address, 70, 92)
      .text(`Tel: ${settings.phone}  |  ${settings.email}`, 70, 104);

    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(COLORS.accent)
      .text('BOLETA DE VENTA', 0, 72, { align: 'right', width: doc.page.width - 70 });

    doc.fillColor(COLORS.text);
    doc.y = 130;
  }

  private drawSaleMeta(doc: PDFKit.PDFDocument, sale: Sale) {
    const top = 130;
    const colW = (doc.page.width - 100) / 2;

    this.drawBox(doc, 50, top, colW - 5, 60);
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.muted).text('N° DE VENTA', 60, top + 8);
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(this.buildVtNumber(sale), 60, top + 20);

    const rx = 50 + colW + 5;
    this.drawBox(doc, rx, top, colW - 5, 60);
    doc.fontSize(8).font('Helvetica').fillColor(COLORS.muted).text('FECHA DE EMISIÓN', rx + 10, top + 8);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLORS.text)
      .text(this.formatDate(sale.createdAt), rx + 10, top + 20);

    doc.fontSize(8).font('Helvetica').fillColor(COLORS.muted).text('PAGO', rx + 10, top + 38);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLORS.accent)
      .text(PAYMENT_LABELS[sale.paymentMethod] ?? sale.paymentMethod, rx + 10, top + 48);

    doc.fillColor(COLORS.text);
    doc.y = top + 75;
  }

  private drawCustomerInfo(doc: PDFKit.PDFDocument, sale: Sale) {
    const c = sale.customer;
    const top = doc.y + 10;

    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text('DATOS DEL CLIENTE', 50, top);
    doc.moveTo(50, top + 12).lineTo(doc.page.width - 50, top + 12).strokeColor(COLORS.accent).lineWidth(1.5).stroke();

    const lineH = 14;
    let y = top + 18;

    const dniLabel = c?.dni ? `DNI: ${c.dni}` : '—';
    const vendedorName = (sale.user as any)?.name ?? '—';

    const rows = [
      ['Nombre:', c?.names ?? '—'],
      ['Documento:', dniLabel],
      ['Teléfono:', c?.phone ?? '—'],
      ['Vendedor:', vendedorName],
    ];

    for (const [label, value] of rows) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text(label, 50, y, { continued: false, width: 110 });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.text).text(value, 165, y, { width: doc.page.width - 215 });
      y += lineH;
    }

    if (sale.notes) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text('Notas:', 50, y, { continued: false, width: 110 });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.text).text(sale.notes, 165, y, { width: doc.page.width - 215 });
      y += lineH;
    }

    doc.y = y + 10;
  }

  private drawDetailsTable(doc: PDFKit.PDFDocument, details: SaleDetail[]) {
    const top = doc.y + 10;
    const tableLeft = 50;
    const tableWidth = doc.page.width - 100;

    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text('DETALLE DE LA VENTA', tableLeft, top);
    doc.moveTo(tableLeft, top + 12).lineTo(doc.page.width - 50, top + 12).strokeColor(COLORS.accent).lineWidth(1.5).stroke();

    const cols = [
      { label: '#',           width: 25,  align: 'center' as const },
      { label: 'Código',      width: 80,  align: 'left'   as const },
      { label: 'Descripción', width: 185, align: 'left'   as const },
      { label: 'Peso (g)',    width: 55,  align: 'right'  as const },
      { label: 'Precio/g',   width: 75,  align: 'right'  as const },
      { label: 'Total',       width: 75,  align: 'right'  as const },
    ];

    const rowH = 20;
    const headerY = top + 18;

    doc.rect(tableLeft, headerY, tableWidth, rowH).fill(COLORS.primary);

    let cx = tableLeft;
    for (const col of cols) {
      doc
        .fontSize(8)
        .font('Helvetica-Bold')
        .fillColor('#ffffff')
        .text(col.label, cx + 4, headerY + 6, { width: col.width - 8, align: col.align });
      cx += col.width;
    }

    let rowY = headerY + rowH;

    if (details.length === 0) {
      doc.rect(tableLeft, rowY, tableWidth, rowH).fill(COLORS.light);
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted).text('Sin detalles registrados.', tableLeft + 10, rowY + 6);
      rowY += rowH;
    }

    for (let i = 0; i < details.length; i++) {
      const d = details[i];
      const bg = i % 2 === 0 ? '#ffffff' : COLORS.light;
      doc.rect(tableLeft, rowY, tableWidth, rowH).fill(bg);

      const p = d.product;
      const po = (p as any)?.po ?? `#${p?.id}`;
      const description = p?.name ?? '—';
      const unitPrice = Number(d.salePrice);
      const weight = Number(p?.weight ?? 0);
      const rowTotal = unitPrice * weight;

      const cells = [
        { value: String(i + 1),                    align: 'center' as const },
        { value: po,                                align: 'left'   as const },
        { value: description,                       align: 'left'   as const },
        { value: weight > 0 ? `${weight} g` : '—', align: 'right'  as const },
        { value: this.formatCurrency(unitPrice),    align: 'right'  as const },
        { value: this.formatCurrency(rowTotal),     align: 'right'  as const },
      ];

      cx = tableLeft;
      for (let j = 0; j < cols.length; j++) {
        doc
          .fontSize(8)
          .font('Helvetica')
          .fillColor(COLORS.text)
          .text(cells[j].value, cx + 4, rowY + 6, { width: cols[j].width - 8, align: cells[j].align });
        cx += cols[j].width;
      }

      rowY += rowH;
    }

    doc.moveTo(tableLeft, rowY).lineTo(tableLeft + tableWidth, rowY).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    doc.y = rowY + 10;
  }

  private drawPaymentSummary(doc: PDFKit.PDFDocument, sale: Sale) {
    const payments = [...(sale.payments ?? [])].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const total = Number(sale.totalAmount);
    const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balance = total - paid;

    // ── Tabla de pagos ────────────────────────────────────────────────────────
    if (payments.length > 0) {
      const tableLeft = 50;
      const tableWidth = doc.page.width - 100;
      const top = doc.y + 10;

      doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text('HISTORIAL DE PAGOS', tableLeft, top);
      doc.moveTo(tableLeft, top + 12).lineTo(doc.page.width - 50, top + 12).strokeColor(COLORS.accent).lineWidth(1.5).stroke();

      const cols = [
        { label: '#',     width: 25,  align: 'center' as const },
        { label: 'Tipo',  width: 110, align: 'left'   as const },
        { label: 'Fecha', width: 155, align: 'left'   as const },
        { label: 'Monto', width: 205, align: 'right'  as const },
      ];

      const rowH = 20;
      const headerY = top + 18;

      doc.rect(tableLeft, headerY, tableWidth, rowH).fill(COLORS.primary);
      let cx = tableLeft;
      for (const col of cols) {
        doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff')
          .text(col.label, cx + 4, headerY + 6, { width: col.width - 8, align: col.align });
        cx += col.width;
      }

      let rowY = headerY + rowH;
      for (let i = 0; i < payments.length; i++) {
        const p = payments[i];
        doc.rect(tableLeft, rowY, tableWidth, rowH).fill(i % 2 === 0 ? '#ffffff' : COLORS.light);

        const typeLabel = p.type === SalePaymentType.CASH ? 'Efectivo' : 'Transferencia';
        const cells = [
          { value: String(i + 1),                        align: 'center' as const },
          { value: typeLabel,                             align: 'left'   as const },
          { value: this.formatDate(p.createdAt),          align: 'left'   as const },
          { value: this.formatCurrency(Number(p.amount)), align: 'right'  as const },
        ];

        cx = tableLeft;
        for (let j = 0; j < cols.length; j++) {
          doc.fontSize(8).font('Helvetica').fillColor(COLORS.text)
            .text(cells[j].value, cx + 4, rowY + 6, { width: cols[j].width - 8, align: cells[j].align });
          cx += cols[j].width;
        }
        rowY += rowH;
      }

      doc.moveTo(tableLeft, rowY).lineTo(tableLeft + tableWidth, rowY).strokeColor(COLORS.border).lineWidth(0.5).stroke();
      doc.y = rowY + 10;
    }

    // ── Resumen de totales ────────────────────────────────────────────────────
    const summaryX = doc.page.width - 50 - 220;
    let y = doc.y + 6;

    const summaryRows: [string, string][] = [];
    if (paid > 0) summaryRows.push(['Abonado:', this.formatCurrency(paid)]);
    if (balance > 0.01) summaryRows.push(['Saldo pendiente:', this.formatCurrency(balance)]);

    for (const [label, value] of summaryRows) {
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted).text(label, summaryX, y, { width: 130, align: 'right' });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.text).text(value, summaryX + 136, y, { width: 84, align: 'right' });
      y += 14;
    }

    y += 4;
    doc.moveTo(summaryX, y).lineTo(doc.page.width - 50, y).strokeColor(COLORS.border).lineWidth(0.5).stroke();
    y += 6;

    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLORS.primary).text('TOTAL:', summaryX, y, { width: 130, align: 'right' });
    doc.fontSize(12).font('Helvetica-Bold').fillColor(COLORS.accent).text(this.formatCurrency(total), summaryX + 136, y, { width: 84, align: 'right' });

    doc.y = y + 24;
  }

  private drawFooter(doc: PDFKit.PDFDocument, sale: Sale, settings: AppSettings) {
    const footerY = doc.y + 16;
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor(COLORS.border).lineWidth(0.5).stroke();

    const taxPart = settings.taxId ? `  ·  NIT/RUC ${settings.taxId}` : '';
    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text(
        `Documento generado el ${this.formatDate(new Date())}  ·  ${settings.companyName}${taxPart}  ·  Venta ID: ${sale.id}`,
        50,
        footerY + 8,
        { align: 'center', width: doc.page.width - 100 },
      );
  }

  // ─── Utilidades ──────────────────────────────────────────────────────────────

  private drawBox(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number) {
    doc.rect(x, y, w, h).strokeColor(COLORS.border).lineWidth(0.5).stroke();
  }

  private buildVtNumber(sale: Sale): string {
    const year = new Date(sale.createdAt).getFullYear();
    return `VT-${year}-${String(sale.id).padStart(4, '0')}`;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }
}
