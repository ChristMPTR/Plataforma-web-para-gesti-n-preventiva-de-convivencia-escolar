import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Curso, Estudiante } from '../../core/models/models';

@Component({
  selector: 'app-cursos',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './cursos.component.html',
  styleUrl: './cursos.component.scss',
})
export class CursosComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);

  cursos: any[] = [];
  loading = true;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;

  nivelFilter = '';
  anioFilter: number | undefined = undefined;
  anios = [2024, 2025, 2026];

  niveles = [
    'Pre Kinder', 'Kinder',
    '1 Básico', '2 Básico', '3 Básico', '4 Básico',
    '5 Básico', '6 Básico', '7 Básico', '8 Básico',
    '1 Medio', '2 Medio', '3 Medio', '4 Medio',
  ];

  showModal = false;
  isEdit = false;
  selectedCurso?: any;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup;

  selectedCursoDetail?: any;
  estudiantesCurso: any[] = [];

  constructor() {
    this.form = this.fb.group({
      nivel: ['', Validators.required],
      letra: ['', Validators.required],
      anio: [new Date().getFullYear(), Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadCursos();
  }

  loadCursos(): void {
    this.loading = true;
    this.supabase.getCursos({
      nivel: this.nivelFilter || undefined,
      año: this.anioFilter || undefined,
      page: this.page,
      limit: this.limit,
    }).subscribe((res: any) => {
      this.cursos = res.data ?? [];
      this.total = res.count ?? 0;
      this.totalPages = Math.ceil((res.count ?? 0) / this.limit);
      this.loading = false;
    });
  }

  onFilter(): void {
    this.page = 1;
    this.loadCursos();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadCursos();
  }

  openCreate(): void {
    this.isEdit = false;
    this.selectedCurso = undefined;
    this.form.reset({ nivel: '', seccion: '', anio: new Date().getFullYear() });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEdit(curso: any, event: Event): void {
    event.stopPropagation();
    this.isEdit = true;
    this.selectedCurso = curso;
    this.form.patchValue({
      nivel: curso.nivel,
      letra: curso.letra,
      anio: curso.anio,
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
    const data = this.form.value;

    const request = this.isEdit && this.selectedCurso?.id
      ? this.supabase.updateCursoRx(this.selectedCurso.id, data)
      : this.supabase.createCursoRx(data);

    request.subscribe({
      next: () => {
        this.saving = false;
        this.successMsg = `Curso ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`;
        this.loadCursos();
        setTimeout(() => this.closeModal(), 1200);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err?.message || 'Error al guardar';
      },
    });
  }

  verDetalle(curso: any): void {
    this.selectedCursoDetail = curso;
    this.estudiantesCurso = [];
    this.supabase.getEstudiantesByCurso(curso.id).subscribe((data: any) => {
      this.estudiantesCurso = data ?? [];
    });
  }

  cerrarDetalle(): void {
    this.selectedCursoDetail = undefined;
    this.estudiantesCurso = [];
  }

  getEstadoClass(e: string): string {
    return e === 'activo' ? 'badge-success' : 'badge-danger';
  }
}
