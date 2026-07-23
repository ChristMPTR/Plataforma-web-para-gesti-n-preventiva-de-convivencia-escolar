import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-recursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './recursos.component.html',
  styleUrl: './recursos.component.scss',
})
export class RecursosComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);

  recursos: any[] = [];
  loading = true;

  showModal = false;
  isEdit = false;
  selectedRecurso: any = null;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup;

  tipos = ['documento', 'enlace', 'contacto', 'guia', 'normativa', 'otro'];

  constructor() {
    this.form = this.fb.group({
      titulo: ['', Validators.required],
      descripcion: [''],
      tipo: ['documento', Validators.required],
      url: [''],
    });
  }

  ngOnInit(): void {
    this.loadRecursos();
  }

  loadRecursos(): void {
    this.loading = true;
    this.supabase.getRecursos().subscribe({
      next: (data) => {
        this.recursos = data ?? [];
        this.loading = false;
      },
      error: () => {
        this.recursos = [];
        this.loading = false;
      },
    });
  }

  openCreate(): void {
    this.isEdit = false;
    this.selectedRecurso = null;
    this.form.reset({ titulo: '', descripcion: '', tipo: 'documento', url: '' });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEdit(recurso: any): void {
    this.isEdit = true;
    this.selectedRecurso = recurso;
    this.form.patchValue({
      titulo: recurso.titulo,
      descripcion: recurso.descripcion ?? '',
      tipo: recurso.tipo,
      url: recurso.url ?? '',
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

    const request = this.isEdit && this.selectedRecurso?.id
      ? this.supabase.updateRecursoRx(this.selectedRecurso.id, data)
      : this.supabase.createRecursoRx(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = `Recurso ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`;
        this.loadRecursos();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err?.message || 'Error al guardar';
      },
    });
  }

  eliminar(recurso: any): void {
    if (!confirm(`¿Eliminar "${recurso.titulo}"?`)) return;
    this.supabase.deleteRecursoRx(recurso.id).subscribe({
      next: () => {
        this.successMsg = 'Recurso eliminado';
        this.loadRecursos();
      },
      error: (err: any) => {
        this.errorMsg = err?.message || 'Error al eliminar';
      },
    });
  }

  getTipoIcon(tipo: string): string {
    const icons: Record<string, string> = {
      documento: 'description', enlace: 'link', contacto: 'contact_phone',
      guia: 'menu_book', normativa: 'gavel', otro: 'info',
    };
    return icons[tipo] ?? 'help';
  }
}
