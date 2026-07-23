import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-establecimientos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './establecimientos.component.html',
  styleUrl: './establecimientos.component.scss',
})
export class EstablecimientosComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);

  colegios: any[] = [];
  loading = true;

  showModal = false;
  isEdit = false;
  selectedColegio: any = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      direccion: [''],
      estado: ['activo', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadColegios();
  }

  loadColegios(): void {
    this.loading = true;
    this.supabase.getColegios().subscribe({
      next: (data) => {
        this.colegios = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.colegios = [];
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.isEdit = false;
    this.selectedColegio = null;
    this.form.reset({ nombre: '', direccion: '', estado: 'activo' });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEdit(colegio: any): void {
    this.isEdit = true;
    this.selectedColegio = colegio;
    this.form.patchValue({
      nombre: colegio.nombre,
      direccion: colegio.direccion ?? '',
      estado: colegio.estado ?? 'activo',
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
    const data = { ...this.form.value };

    const request = this.isEdit && this.selectedColegio?.id
      ? this.supabase.updateColegioRx(this.selectedColegio.id, data)
      : this.supabase.createColegioRx(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = `Establecimiento ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`;
        this.loadColegios();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err?.message || 'Error al guardar';
      },
    });
  }

  eliminar(colegio: any): void {
    if (!confirm(`¿Eliminar "${colegio.nombre}"?`)) return;
    this.supabase.deleteColegioRx(colegio.id).subscribe({
      next: () => {
        this.successMsg = 'Establecimiento eliminado';
        this.loadColegios();
      },
      error: (err: any) => {
        this.errorMsg = err?.message || 'Error al eliminar';
      },
    });
  }

  getEstadoClass(e: string): string {
    return e === 'activo' ? 'badge-success' : 'badge-danger';
  }
}
