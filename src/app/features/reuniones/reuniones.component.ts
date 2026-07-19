import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { ReunionApoderado, CasoConvivencia } from '../../core/models/models';

@Component({
  selector: 'app-reuniones',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reuniones.component.html',
  styleUrl: './reuniones.component.scss',
})
export class ReunionesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);

  reuniones: any[] = [];
  casos: any[] = [];
  loading = true;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;

  showModal = false;
  isEdit = false;
  selectedReunion?: any;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      fecha: [new Date().toISOString().split('T')[0], Validators.required],
      apoderado: ['', Validators.required],
      motivo: ['', Validators.required],
      acuerdos: [''],
      observaciones: [''],
      id_caso: [null],
    });
  }

  ngOnInit(): void {
    this.loadReuniones();
    this.supabase.getCasos({ page: 1, limit: 200 }).subscribe((res) => {
      this.casos = res.data;
    });
  }

  loadReuniones(): void {
    this.loading = true;
    this.supabase.getReuniones(this.page, this.limit).subscribe((res) => {
      this.reuniones = res.data;
      this.total = res.count;
      this.totalPages = Math.ceil(res.count / this.limit);
      this.loading = false;
    });
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadReuniones();
  }

  openCreate(): void {
    this.isEdit = false;
    this.selectedReunion = undefined;
    this.form.reset({ fecha: new Date().toISOString().split('T')[0], acuerdos: '', observaciones: '', id_caso: null });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEdit(rep: any, event: Event): void {
    event.stopPropagation();
    this.isEdit = true;
    this.selectedReunion = rep;
    this.form.patchValue({
      fecha: rep.fecha ? rep.fecha.substring(0, 10) : '',
      apoderado: rep.apoderado || '',
      motivo: rep.motivo,
      acuerdos: rep.acuerdos,
      observaciones: rep.observaciones,
      id_caso: rep.id_caso,
    });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  closeModal(): void {
    this.showModal = false;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    const formData = this.form.value;

    // Map form fields to DB columns
    const dbData: any = {
      fecha: formData.fecha,
      motivo: formData.motivo,
      acuerdos: formData.acuerdos || '',
      observaciones: formData.observaciones || '',
      id_caso: formData.id_caso || null,
      id_colegio: 1,  // Liceo Ejemplo Santiago
      responsable: 2,  // Encargado de Convivencia
    };

    const request = this.isEdit && this.selectedReunion?.id
      ? this.supabase.updateReunionRx(this.selectedReunion.id, dbData)
      : this.supabase.createReunionRx(dbData);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = `Reunión ${this.isEdit ? 'actualizada' : 'creada'} exitosamente`;
        this.loadReuniones();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err.message || 'Error al guardar';
      },
    });
  }

  async descargarActa(rep: any): Promise<void> {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFontSize(18);
    doc.text('Acta de Reunión', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(10);
    doc.text(`Nexora - Sistema de Convivencia Escolar`, pageWidth / 2, 28, { align: 'center' });

    doc.setDrawColor(26, 82, 118);
    doc.line(14, 32, pageWidth - 14, 32);

    doc.setFontSize(11);
    let y = 42;

    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(rep.fecha).toLocaleDateString('es-CL'), 50, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Apoderado:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(rep.apoderado, 50, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Motivo:', 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(rep.motivo, 50, y);
    y += 8;

    if (rep.caso_id || rep.id_caso) {
      doc.setFont('helvetica', 'bold');
      doc.text('Caso Relacionado:', 14, y);
      doc.setFont('helvetica', 'normal');
      doc.text(`Caso #${rep.caso_id || rep.id_caso}`, 50, y);
      y += 8;
    }

    y += 6;

    if (rep.acuerdos) {
      doc.setFont('helvetica', 'bold');
      doc.text('Acuerdos:', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const acuerdosLines = doc.splitTextToSize(rep.acuerdos, pageWidth - 28);
      doc.text(acuerdosLines, 14, y);
      y += acuerdosLines.length * 5 + 6;
    }

    if (rep.observaciones) {
      doc.setFont('helvetica', 'bold');
      doc.text('Observaciones:', 14, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(rep.observaciones, pageWidth - 28);
      doc.text(obsLines, 14, y);
      y += obsLines.length * 5 + 6;
    }

    y += 10;
    doc.setDrawColor(200);
    doc.line(14, y, pageWidth - 14, y);
    y += 8;
    doc.setFontSize(8);
    doc.text(`Documento generado el ${new Date().toLocaleDateString('es-CL')} por Nexora`, pageWidth / 2, y, { align: 'center' });

    const fileName = `Acta_Reunion_${rep.apoderado.replace(/\s+/g, '_')}_${rep.fecha.substring(0, 10)}.pdf`;
    doc.save(fileName);
  }
}
