import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.scss',
})
export class SolicitudesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);

  solicitudes: any[] = [];
  estudiantes: any[] = [];
  loading = true;

  showModal = false;
  isEdit = false;
  selectedSolicitud: any = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id_estudiante: ['', Validators.required],
      descripcion: ['', Validators.required],
      estado: ['pendiente', Validators.required],
      respuesta: [''],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.supabase.getEstudiantesList().subscribe({
      next: (data) => { this.estudiantes = data ?? []; },
      error: () => { this.estudiantes = []; },
    });
    this.supabase.getSolicitudes().subscribe({
      next: (data) => {
        this.solicitudes = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.solicitudes = [];
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.isEdit = false;
    this.selectedSolicitud = null;
    this.form.reset({ id_estudiante: '', descripcion: '', estado: 'pendiente', respuesta: '' });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEdit(sol: any): void {
    this.isEdit = true;
    this.selectedSolicitud = sol;
    this.form.patchValue({
      id_estudiante: sol.id_estudiante,
      descripcion: sol.descripcion,
      estado: sol.estado,
      respuesta: sol.respuesta ?? '',
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
    const data = { ...this.form.value, id_colegio: 1 };

    const request = this.isEdit && this.selectedSolicitud?.id
      ? this.supabase.updateSolicitudRx(this.selectedSolicitud.id, data)
      : this.supabase.createSolicitudRx(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = `Solicitud ${this.isEdit ? 'actualizada' : 'creada'} exitosamente`;
        this.loadData();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err?.message || 'Error al guardar';
      },
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'pendiente': return 'badge-warning';
      case 'en_revision': return 'badge-info';
      case 'resuelto': return 'badge-success';
      case 'rechazado': return 'badge-danger';
      default: return 'badge-default';
    }
  }
}
