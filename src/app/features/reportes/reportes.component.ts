import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { Curso } from '../../core/models/models';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './reportes.component.html',
  styleUrl: './reportes.component.scss',
})
export class ReportesComponent implements OnInit {
  private supabase = inject(SupabaseService);

  cursos: Curso[] = [];
  casos: any[] = [];
  loading = false;
  generated = false;

  desde = '';
  hasta = '';
  cursoFilter = '';
  tipoFilter = '';

  tipoOptions = [
    { value: 'conflicto_entre_estudiantes', label: 'Conflicto entre Estudiantes' },
    { value: 'conducta', label: 'Problemas de Conducta' },
    { value: 'convivencia', label: 'Problemas de Convivencia' },
    { value: 'acoso', label: 'Acoso' },
    { value: 'otro', label: 'Otro' },
  ];

  totalEnPeriodo = 0;
  porTipo: { tipo: string; cantidad: number }[] = [];
  porEstado: { estado: string; cantidad: number }[] = [];

  ngOnInit(): void {
    this.supabase.getCursos({ page: 1, limit: 200 }).subscribe((res) => {
      this.cursos = res.data;
    });
  }

  generarReporte(): void {
    this.loading = true;
    this.generated = false;

    this.supabase.getCasos({
      desde: this.desde || undefined,
      hasta: this.hasta || undefined,
      tipo: this.tipoFilter || undefined,
      page: 1,
      limit: 1000,
    }).subscribe((res) => {
      this.casos = res.data;
      this.totalEnPeriodo = res.count;

      const tipoMap: Record<string, number> = {};
      const estadoMap: Record<string, number> = {};

      this.casos.forEach((c) => {
        tipoMap[c.tipo_caso] = (tipoMap[c.tipo_caso] || 0) + 1;
        estadoMap[c.estado] = (estadoMap[c.estado] || 0) + 1;
      });

      this.porTipo = Object.entries(tipoMap).map(([tipo, cantidad]) => ({ tipo, cantidad }));
      this.porEstado = Object.entries(estadoMap).map(([estado, cantidad]) => ({ estado, cantidad }));

      this.loading = false;
      this.generated = true;
    });
  }

  exportarPdf(): void {
    import('jspdf').then(async ({ jsPDF }) => {
      await import('jspdf-autotable');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      doc.setFontSize(18);
      doc.text('Reporte de Casos', pageWidth / 2, 20, { align: 'center' });
      doc.setFontSize(10);
      doc.text(`Período: ${this.desde || '—'} a ${this.hasta || '—'}`, pageWidth / 2, 28, { align: 'center' });

      doc.setDrawColor(26, 82, 118);
      doc.line(14, 32, pageWidth - 14, 32);

      let y = 42;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`Total de casos en el período: ${this.totalEnPeriodo}`, 14, y);
      y += 10;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text('Por Tipo:', 14, y);
      y += 6;
      this.porTipo.forEach(({ tipo, cantidad }) => {
        doc.text(`  ${tipo}: ${cantidad}`, 20, y);
        y += 5;
      });

      y += 4;
      doc.text('Por Estado:', 14, y);
      y += 6;
      this.porEstado.forEach(({ estado, cantidad }) => {
        doc.text(`  ${estado}: ${cantidad}`, 20, y);
        y += 5;
      });

      y += 8;
      if (this.casos.length) {
        const tableData = this.casos.map((c) => [
          c.id,
          c.estudiante_nombre || '',
          c.tipo_caso,
          c.prioridad,
          c.estado,
          c.created_at ? new Date(c.created_at).toLocaleDateString('es-CL') : '',
        ]);

        (doc as any).autoTable({
          startY: y,
          head: [['ID', 'Estudiante', 'Tipo', 'Prioridad', 'Estado', 'Fecha']],
          body: tableData,
          theme: 'striped',
          headStyles: { fillColor: [26, 82, 118] },
        });
      }

      doc.save(`Reporte_Casos_${this.desde || 'inicio'}_${this.hasta || 'fin'}.pdf`);
    });
  }

  prioridadClass(p: string): string {
    const map: Record<string, string> = { baja: 'badge-success', media: 'badge-warning', alta: 'badge-danger', urgente: 'badge-dark', critica: 'badge-dark' };
    return map[p] ?? '';
  }

  estadoClass(e: string): string {
    const map: Record<string, string> = { abierto: 'badge-primary', en_seguimiento: 'badge-warning', cerrado: 'badge-success' };
    return map[e] ?? '';
  }

  exportarExcel(): void {
    const data = this.casos.map((c) => ({
      ID: c.id,
      Estudiante: c.estudiante_nombre,
      Tipo: c.tipo_caso,
      Prioridad: c.prioridad,
      Estado: c.estado,
      Fecha: c.created_at ? new Date(c.created_at).toLocaleDateString('es-CL') : '',
    }));

    const summary = [
      { label: 'Resumen', value: '' },
      { label: 'Total Casos', value: this.totalEnPeriodo.toString() },
      ...this.porTipo.map(({ tipo, cantidad }) => ({ label: `Tipo: ${tipo}`, value: cantidad.toString() })),
      ...this.porEstado.map(({ estado, cantidad }) => ({ label: `Estado: ${estado}`, value: cantidad.toString() })),
      { label: '', value: '' },
      { label: 'Detalle de Casos', value: '' },
    ];

    const summarySheet = XLSX.utils.json_to_sheet(summary);
    const detailSheet = XLSX.utils.json_to_sheet(data);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, summarySheet, 'Resumen');
    XLSX.utils.book_append_sheet(wb, detailSheet, 'Casos');

    // Set column widths
    detailSheet['!cols'] = [
      { wch: 8 }, { wch: 30 }, { wch: 25 }, { wch: 12 }, { wch: 14 }, { wch: 14 },
    ];

    XLSX.writeFile(wb, `Reporte_Casos_${this.desde || 'inicio'}_${this.hasta || 'fin'}.xlsx`);
  }
}
