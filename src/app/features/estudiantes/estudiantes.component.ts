import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Estudiante, Curso } from '../../core/models/models';

@Component({
  selector: 'app-estudiantes',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './estudiantes.component.html',
  styleUrl: './estudiantes.component.scss',
})
export class EstudiantesComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private fb = inject(FormBuilder);

  estudiantes: any[] = [];
  cursos: Curso[] = [];
  loading = true;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;
  search = '';

  showModal = false;
  isEdit = false;
  selectedEst?: Estudiante;
  saving = false;
  successMsg = '';
  errorMsg = '';

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      rut: [''],
      estado: ['activo', Validators.required],
      id_curso: [null],
    });
  }

  ngOnInit(): void {
    this.loadEstudiantes();
    this.supabase.getCursos({ page: 1, limit: 100 }).subscribe((res) => {
      this.cursos = res.data;
    });
  }

  loadEstudiantes(): void {
    this.loading = true;
    this.supabase.getEstudiantes(this.search || undefined, this.page, this.limit).subscribe((res) => {
      this.estudiantes = res.data;
      this.total = res.count;
      this.totalPages = Math.ceil(res.count / this.limit);
      this.loading = false;
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadEstudiantes();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadEstudiantes();
  }

  openCreate(): void {
    this.isEdit = false;
    this.selectedEst = undefined;
    this.form.reset({ estado: 'activo', id_curso: null });
    this.showModal = true;
    this.successMsg = '';
    this.errorMsg = '';
  }

  openEdit(est: any, event: Event): void {
    event.stopPropagation();
    this.isEdit = true;
    this.selectedEst = est;
    // Extract current course from matriculas
    const matriculaActiva = est.matriculas?.find((m: any) => m.estado === 'activo') ?? est.matriculas?.[0];
    this.form.patchValue({
      nombre: est.nombre,
      rut: est.rut,
      estado: est.estado,
      id_curso: matriculaActiva?.id_curso ?? null,
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
    const { id_curso, ...estData } = this.form.value;
    const payload = { ...estData, id_colegio: 1 };  // Liceo Ejemplo Santiago

    const request = this.isEdit && this.selectedEst?.id
      ? this.supabase.updateEstudianteRx(this.selectedEst.id, payload)
      : this.supabase.createEstudianteRx(payload);

    request.subscribe({
      next: (result: any) => {
        const estId = result?.id ?? this.selectedEst?.id;
        // If a course was selected, create or update the matricula
        if (id_curso && estId) {
          this.saveMatricula(estId, id_curso);
        } else {
          this.saving = false;
          this.successMsg = `Estudiante ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`;
          this.loadEstudiantes();
          setTimeout(() => this.closeModal(), 1200);
        }
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err.message || 'Error al guardar';
      },
    });
  }

  private saveMatricula(estId: number, cursoId: number): void {
    const matriculaPayload = {
      id_estudiante: estId,
      id_curso: cursoId,
      anio_escolar: new Date().getFullYear(),
      estado: 'activo',
    };

    // createMatricula returns a Promise, not Observable
    this.supabase.createMatricula(matriculaPayload as any)
      .then(() => {
        this.saving = false;
        this.successMsg = `Estudiante ${this.isEdit ? 'actualizado' : 'creado'} con curso asignado`;
        this.loadEstudiantes();
        setTimeout(() => this.closeModal(), 1200);
      })
      .catch((err: any) => {
        // Student was created but matricula failed — still show partial success
        this.saving = false;
        this.successMsg = `Estudiante ${this.isEdit ? 'actualizado' : 'creado'} (error al asignar curso: ${err.message ?? err})`;
        this.loadEstudiantes();
        setTimeout(() => this.closeModal(), 1500);
      });
  }

  getEstadoClass(e: any): string {
    return e === 'activo' || e === true ? 'badge-success' : 'badge-danger';
  }
}
