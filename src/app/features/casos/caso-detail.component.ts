import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-caso-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './caso-detail.component.html',
  styleUrl: './caso-detail.component.scss',
})
export class CasoDetailComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  caso: any = null;
  involucrados: any[] = [];
  evidencias: any[] = [];
  seguimientos: any[] = [];
  reuniones: any[] = [];
  loading = true;
  selectedEstado = '';

  seguimientoForm = { accion_realizada: '', observacion: '' };
  savingSeguimiento = false;

  // Involucrados
  involucradoForm = { tipo: 'involucrado', id_estudiante: '', nombre_externo: '' };
  estudiantesList: any[] = [];
  isInvolucradoExterno = false;

  // Evidencias
  evidenciaFile: File | null = null;
  evidenciaDescripcion = '';
  uploadingEvidencia = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCaso(id);
    this.loadEstudiantes();
  }

  private loadEstudiantes(): void {
    this.supabase.getEstudiantesList().subscribe({
      next: (data) => { this.estudiantesList = data ?? []; },
      error: () => { this.estudiantesList = []; },
    });
  }

  private loadCaso(id: number): void {
    this.loading = true;
    this.supabase.getCaso(id).subscribe((caso: any) => {
      if (caso) {
        this.caso = caso;
        this.selectedEstado = caso.estado;
      }
      this.loading = false;
    });

    this.supabase.getSeguimientosByCaso(id).subscribe((data: any) => {
      this.seguimientos = data ?? [];
    });

    this.supabase.getReunionesByCaso(id).subscribe((data: any) => {
      this.reuniones = data ?? [];
    });

    this.supabase.getInvolucradosByCasoRx(id).subscribe((data: any) => {
      this.involucrados = data ?? [];
    });

    this.supabase.getEvidenciasByCaso(id).subscribe((data: any) => {
      this.evidencias = data ?? [];
    });
  }

  cambiarEstado(): void {
    if (!this.caso?.id || !this.selectedEstado) return;
    this.supabase.updateCaso(this.caso.id, { estado: this.selectedEstado }).subscribe(() => {
      this.caso.estado = this.selectedEstado;
    });
  }

  agregarSeguimiento(): void {
    if (!this.caso?.id || !this.seguimientoForm.accion_realizada) return;

    this.savingSeguimiento = true;
    this.supabase.createSeguimiento({
      id_caso: this.caso.id,
      accion_realizada: this.seguimientoForm.accion_realizada,
      observacion: this.seguimientoForm.observacion,
      fecha: new Date().toISOString(),
    }).subscribe((seg: any) => {
      if (seg) {
        this.seguimientos.unshift(seg);
        this.seguimientoForm = { accion_realizada: '', observacion: '' };
      }
      this.savingSeguimiento = false;
    });
  }

  // Involucrados
  toggleInvolucradoExterno(): void {
    this.isInvolucradoExterno = !this.isInvolucradoExterno;
    this.involucradoForm.id_estudiante = '';
    this.involucradoForm.nombre_externo = '';
  }

  agregarInvolucrado(): void {
    if (!this.caso?.id) return;
    if (this.isInvolucradoExterno && !this.involucradoForm.nombre_externo) return;
    if (!this.isInvolucradoExterno && !this.involucradoForm.id_estudiante) return;

    const inv: any = {
      id_caso: this.caso.id,
      tipo: this.involucradoForm.tipo,
    };
    if (this.isInvolucradoExterno) {
      inv.nombre_externo = this.involucradoForm.nombre_externo;
    } else {
      inv.id_estudiante = Number(this.involucradoForm.id_estudiante);
    }

    this.supabase.addInvolucradoRx(inv).subscribe((data: any) => {
      if (data) {
        this.involucrados.push(data);
        this.involucradoForm = { tipo: 'involucrado', id_estudiante: '', nombre_externo: '' };
      }
    });
  }

  eliminarInvolucrado(inv: any): void {
    if (!confirm('¿Eliminar este involucrado?')) return;
    this.supabase.deleteInvolucradoRx(inv.id).subscribe(() => {
      this.involucrados = this.involucrados.filter(i => i.id !== inv.id);
    });
  }

  // Evidencias
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.evidenciaFile = input.files?.[0] ?? null;
  }

  subirEvidencia(): void {
    if (!this.caso?.id || !this.evidenciaFile) return;
    this.uploadingEvidencia = true;
    const evidencia = {
      id_caso: this.caso.id,
      descripcion: this.evidenciaDescripcion,
    };
    this.supabase.uploadEvidencia(evidencia, this.evidenciaFile).subscribe({
      next: (data: any) => {
        if (data) this.evidencias.unshift(data);
        this.evidenciaFile = null;
        this.evidenciaDescripcion = '';
        this.uploadingEvidencia = false;
      },
      error: () => {
        this.uploadingEvidencia = false;
      },
    });
  }

  eliminarEvidencia(ev: any): void {
    if (!confirm('¿Eliminar esta evidencia?')) return;
    this.supabase.deleteEvidencia(ev.id).subscribe(() => {
      this.evidencias = this.evidencias.filter(e => e.id !== ev.id);
    });
  }

  goBack(): void {
    this.router.navigate(['/casos']);
  }

  editar(): void {
    this.router.navigate(['/casos', this.caso?.id, 'editar']);
  }

  prioridadClass(p: string): string {
    const map: Record<string, string> = { baja: 'badge-success', media: 'badge-warning', alta: 'badge-danger', urgente: 'badge-dark', critica: 'badge-dark' };
    return map[p] ?? '';
  }

  estadoClass(e: string): string {
    const map: Record<string, string> = { abierto: 'badge-primary', en_seguimiento: 'badge-warning', cerrado: 'badge-success' };
    return map[e] ?? '';
  }
}
