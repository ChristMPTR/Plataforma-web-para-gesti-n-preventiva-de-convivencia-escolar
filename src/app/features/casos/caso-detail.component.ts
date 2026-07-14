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
  seguimientos: any[] = [];
  reuniones: any[] = [];
  loading = true;
  selectedEstado = '';

  seguimientoForm = { accion_realizada: '', observacion: '' };
  savingSeguimiento = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadCaso(id);
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

  goBack(): void {
    this.router.navigate(['/casos']);
  }

  editar(): void {
    this.router.navigate(['/casos/editar', this.caso?.id]);
  }

  prioridadClass(p: string): string {
    const map: Record<string, string> = { baja: 'badge-success', media: 'badge-warning', alta: 'badge-danger', critica: 'badge-dark' };
    return map[p] ?? '';
  }

  estadoClass(e: string): string {
    const map: Record<string, string> = { abierto: 'badge-primary', en_seguimiento: 'badge-warning', cerrado: 'badge-success' };
    return map[e] ?? '';
  }
}
