import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import PDFDocument = require('pdfkit');
import { PurchaseOrder } from './entities/purchase-order.entity';
import { PurchaseOrderDetail } from './entities/purchase-order-detail.entity';
import { PurchaseOrderStatus } from './enums/purchase-order-status.enum';

const COMPANY = {
  name: 'Store Hair',
  ruc: '20000000001',
  address: 'Av. Principal 123, Lima, Perú',
  phone: '+51 1 234-5678',
  email: 'contacto@storehair.pe',
};

const STATUS_LABELS: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.PENDING]: 'Pendiente',
  [PurchaseOrderStatus.APPROVED]: 'Aprobada',
  [PurchaseOrderStatus.CANCELED]: 'Cancelada',
  [PurchaseOrderStatus.COMPLETED]: 'Completada',
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
export class PurchaseOrderPdfService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly purchaseOrderRepository: Repository<PurchaseOrder>,
  ) {}

  async generatePdf(id: number): Promise<Buffer> {
    const order = await this.purchaseOrderRepository.findOne({
      where: { id },
      relations: ['supplier', 'supplier.country', 'details', 'user'],
    });

    if (!order) {
      throw new NotFoundException(`Orden de compra con ID ${id} no encontrada`);
    }

    return this.buildPdf(order);
  }

  private buildPdf(order: PurchaseOrder): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      this.drawHeader(doc);
      this.drawOrderMeta(doc, order);
      this.drawSupplierInfo(doc, order);
      this.drawDetailsTable(doc, order.details ?? []);
      this.drawFooter(doc, order);

      doc.end();
    });
  }

  // ─── Secciones ───────────────────────────────────────────────────────────────

  private drawHeader(doc: PDFKit.PDFDocument) {
    // Barra superior
    doc.rect(50, 45, doc.page.width - 100, 70).fill(COLORS.primary);

    doc
      .fillColor('#ffffff')
      .fontSize(22)
      .font('Helvetica-Bold')
      .text(COMPANY.name, 70, 65, { continued: false });

    doc
      .fontSize(9)
      .font('Helvetica')
      .text(COMPANY.address, 70, 92)
      .text(`Tel: ${COMPANY.phone}  |  ${COMPANY.email}`, 70, 104);

    // Etiqueta "ORDEN DE COMPRA" alineada a la derecha dentro del header
    doc
      .fontSize(14)
      .font('Helvetica-Bold')
      .fillColor(COLORS.accent)
      .text('ORDEN DE COMPRA', 0, 72, { align: 'right', width: doc.page.width - 70 });

    doc.fillColor(COLORS.text);
    doc.y = 130;
  }

  private drawOrderMeta(doc: PDFKit.PDFDocument, order: PurchaseOrder) {
    const top = 130;
    const colW = (doc.page.width - 100) / 2;

    // Caja izquierda: número y fecha
    this.drawBox(doc, 50, top, colW - 5, 60);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text('N° DE ORDEN', 60, top + 8);
    doc
      .fontSize(13)
      .font('Helvetica-Bold')
      .fillColor(COLORS.primary)
      .text(this.buildOcNumber(order), 60, top + 20);

    // Caja derecha: fecha y estado
    const rx = 50 + colW + 5;
    this.drawBox(doc, rx, top, colW - 5, 60);
    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text('FECHA DE EMISIÓN', rx + 10, top + 8);
    doc
      .fontSize(10)
      .font('Helvetica-Bold')
      .fillColor(COLORS.text)
      .text(this.formatDate(order.createdAt), rx + 10, top + 20);

    doc
      .fontSize(8)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text('ESTADO', rx + 10, top + 38);

    const statusLabel = STATUS_LABELS[order.status] ?? order.status;
    const statusColor = this.statusColor(order.status);
    doc.fontSize(10).font('Helvetica-Bold').fillColor(statusColor).text(statusLabel, rx + 10, top + 48);

    doc.fillColor(COLORS.text);
    doc.y = top + 75;
  }

  private drawSupplierInfo(doc: PDFKit.PDFDocument, order: PurchaseOrder) {
    const s = order.supplier;
    const top = doc.y + 10;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(COLORS.muted)
      .text('DATOS DEL PROVEEDOR', 50, top);

    doc.moveTo(50, top + 12).lineTo(doc.page.width - 50, top + 12).strokeColor(COLORS.accent).lineWidth(1.5).stroke();

    const lineH = 14;
    let y = top + 18;

    const supplierName = s?.businessName ?? s?.fullName ?? '—';
    const docLabel = s?.ruc ? `RUC: ${s.ruc}` : s?.dni ? `DNI: ${s.dni}` : '—';
    const contactName = s?.contactFullName ?? '—';
    const contactDni = s?.contactDni ? `DNI: ${s.contactDni}` : '';
    const country = s?.country?.name ?? s?.countryId ?? '—';

    const rows = [
      ['Razón / Nombre:', supplierName],
      ['Documento:', docLabel],
      ['Contacto:', contactDni ? `${contactName}  (${contactDni})` : contactName],
      ['Teléfono:', s?.phone ?? '—'],
      ['Email:', s?.email ?? '—'],
      ['Dirección:', s?.address ?? '—'],
      ['País:', country],
    ];

    for (const [label, value] of rows) {
      doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.muted).text(label, 50, y, { continued: false, width: 110 });
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.text).text(value, 165, y, { width: doc.page.width - 215 });
      y += lineH;
    }

    doc.y = y + 10;
  }

  private drawDetailsTable(doc: PDFKit.PDFDocument, details: PurchaseOrderDetail[]) {
    const top = doc.y + 10;
    const tableLeft = 50;
    const tableWidth = doc.page.width - 100;

    doc
      .fontSize(9)
      .font('Helvetica-Bold')
      .fillColor(COLORS.muted)
      .text('DETALLE DE LA ORDEN', tableLeft, top);

    doc.moveTo(tableLeft, top + 12).lineTo(doc.page.width - 50, top + 12).strokeColor(COLORS.accent).lineWidth(1.5).stroke();

    // Columnas: #, Color, Tipo, Largo, Peso, P. Unit., Subtotal
    const cols = [
      { label: '#',         width: 25,  align: 'center' as const },
      { label: 'Color',     width: 80,  align: 'left'   as const },
      { label: 'Tipo',      width: 80,  align: 'left'   as const },
      { label: 'Largo',     width: 55,  align: 'right'  as const },
      { label: 'Peso',      width: 55,  align: 'right'  as const },
      { label: 'P. Unit.',  width: 75,  align: 'right'  as const },
      { label: 'Subtotal',  width: 75,  align: 'right'  as const },
    ];

    const rowH = 20;
    const headerY = top + 18;

    // Encabezado de tabla
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

    // Filas
    let rowY = headerY + rowH;
    let total = 0;

    if (details.length === 0) {
      doc.rect(tableLeft, rowY, tableWidth, rowH).fill(COLORS.light);
      doc.fontSize(9).font('Helvetica').fillColor(COLORS.muted).text('Sin detalles registrados.', tableLeft + 10, rowY + 6);
      rowY += rowH;
    }

    for (let i = 0; i < details.length; i++) {
      const d = details[i];
      const bg = i % 2 === 0 ? '#ffffff' : COLORS.light;
      doc.rect(tableLeft, rowY, tableWidth, rowH).fill(bg);

      const price = Number(d.price);
      const weight = Number(d.weight);
      const subtotal = weight * price;
      total += subtotal;

      const cells = [
        { value: String(i + 1),                       align: 'center' as const },
        { value: d.color,                              align: 'left'   as const },
        { value: d.type,                               align: 'left'   as const },
        { value: `${Number(d.length).toFixed(2)} pg`,  align: 'right'  as const },
        { value: `${weight.toFixed(2)} g`,             align: 'right'  as const },
        { value: this.formatCurrency(price),           align: 'right'  as const },
        { value: this.formatCurrency(subtotal),        align: 'right'  as const },
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

    // Línea inferior tabla
    doc.moveTo(tableLeft, rowY).lineTo(tableLeft + tableWidth, rowY).strokeColor(COLORS.border).lineWidth(0.5).stroke();

    // Fila total
    rowY += 4;
    const totalLabelX = tableLeft + tableWidth - cols[cols.length - 1].width - cols[cols.length - 2].width;
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLORS.primary).text('TOTAL', totalLabelX, rowY, { width: cols[cols.length - 2].width, align: 'right' });
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLORS.accent).text(this.formatCurrency(total), tableLeft + tableWidth - cols[cols.length - 1].width, rowY, { width: cols[cols.length - 1].width - 4, align: 'right' });

    doc.y = rowY + 20;
  }

  private drawFooter(doc: PDFKit.PDFDocument, order: PurchaseOrder) {
    const footerY = doc.y + 16;
    doc.moveTo(50, footerY).lineTo(doc.page.width - 50, footerY).strokeColor(COLORS.border).lineWidth(0.5).stroke();

    doc
      .fontSize(7)
      .font('Helvetica')
      .fillColor(COLORS.muted)
      .text(
        `Documento generado el ${this.formatDate(new Date())}  ·  ${COMPANY.name}  ·  RUC ${COMPANY.ruc}  ·  Orden ID: ${order.id}`,
        50,
        footerY + 8,
        { align: 'center', width: doc.page.width - 100 },
      );
  }

  // ─── Utilidades ──────────────────────────────────────────────────────────────

  private drawBox(doc: PDFKit.PDFDocument, x: number, y: number, w: number, h: number) {
    doc.rect(x, y, w, h).strokeColor(COLORS.border).lineWidth(0.5).stroke();
  }

  private buildOcNumber(order: PurchaseOrder): string {
    const year = new Date(order.createdAt).getFullYear();
    return `OC-${year}-${String(order.id).padStart(4, '0')}`;
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

  private statusColor(status: PurchaseOrderStatus): string {
    const map: Record<PurchaseOrderStatus, string> = {
      [PurchaseOrderStatus.PENDING]: '#e67e22',
      [PurchaseOrderStatus.APPROVED]: '#27ae60',
      [PurchaseOrderStatus.CANCELED]: '#c0392b',
      [PurchaseOrderStatus.COMPLETED]: '#2980b9',
    };
    return map[status] ?? COLORS.text;
  }
}
