import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule, FormBuilder, FormGroup, FormArray, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-caso-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './caso-form.component.html',
  styleUrl: './caso-form.component.scss',
})
export class CasoFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isEdit = false;
  casoId?: number;
  loading = false;
  saving = false;
  successMsg = '';
  errorMsg = '';

  estudiantes: any[] = [];
  estudianteSearch = '';

  tipoOptions = ['conflicto_entre_estudiantes', 'conducta', 'convivencia', 'acoso', 'otro'];

  form: FormGroup;

  constructor() {
    this.form = this.fb.group({
      id_estudiante: ['', Validators.required],
      tipo_caso: ['', Validators.required],
      prioridad: ['media', Validators.required],
      descripcion: ['', Validators.required],
      involucrados: this.fb.array([]),
    });
  }

  get involucrados(): FormArray {
    return this.form.get('involucrados') as FormArray;
  }

  ngOnInit(): void {
    this.casoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdit = !!this.casoId;

    this.loadEstudiantes();

    if (this.isEdit) {
      this.loadCaso();
    }
  }

  private loadEstudiantes(): void {
    this.supabase.getEstudiantes('', 1, 200).subscribe((res: any) => {
      this.estudiantes = res.data ?? [];
    });
  }

  private loadCaso(): void {
    this.loading = true;
    this.supabase.getCaso(this.casoId!).subscribe((caso: any) => {
      if (caso) {
        this.form.patchValue({
          id_estudiante: caso.id_estudiante,
          tipo_caso: caso.tipo_caso,
          prioridad: caso.prioridad,
          descripcion: caso.descripcion,
        });
      }
      this.loading = false;
    });
  }

  addInvolucrado(): void {
    this.involucrados.push(this.fb.group({
      tipo: ['involucrado', Validators.required],
      id_estudiante: [''],
      nombre_externo: [''],
    }));
  }

  removeInvolucrado(index: number): void {
    this.involucrados.removeAt(index);
  }

  filterEstudiantes(): any[] {
    if (!this.estudianteSearch) return this.estudiantes;
    return this.estudiantes.filter((e: any) =>
      (e.nombre ?? '').toLowerCase().includes(this.estudianteSearch.toLowerCase()) ||
      (e.rut ?? '').toLowerCase().includes(this.estudianteSearch.toLowerCase())
    );
  }

  selectEstudiante(est: any): void {
    this.form.get('id_estudiante')?.setValue(est.id);
    this.estudianteSearch = `${est.nombre} (${est.rut})`;
  }

  clearEstudiante(): void {
    this.estudianteSearch = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    this.successMsg = '';
    this.errorMsg = '';
    const formData = {
      ...this.form.value,
      id_colegio: 1,  // Liceo Ejemplo Santiago
      estado: 'abierto',
    };

    // Remove involucrados from the main insert (it's a separate table)
    const { involucrados, ...casoData } = formData;

    const request = this.isEdit
      ? this.supabase.updateCaso(this.casoId!, casoData)
      : this.supabase.createCaso(casoData);

    request.subscribe({
      next: (caso: any) => {
        this.saving = false;
        this.successMsg = `Caso ${this.isEdit ? 'actualizado' : 'creado'} exitosamente`;
        setTimeout(() => this.router.navigate(['/casos', caso?.id ?? this.casoId]), 1500);
      },
      error: (err: any) => {
        this.saving = false;
        this.errorMsg = err?.message || err?.error?.message || 'Error al guardar el caso';
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/casos']);
  }
}
