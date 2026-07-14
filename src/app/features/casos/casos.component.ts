import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-casos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './casos.component.html',
  styleUrl: './casos.component.scss',
})
export class CasosComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  casos: any[] = [];
  loading = true;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;

  search = '';
  tipoFilter = '';
  estadoFilter = '';
  prioridadFilter = '';
  desde = '';
  hasta = '';

  tipoOptions = ['conflicto_entre_estudiantes', 'conducta', 'convivencia', 'acoso', 'otro'];
  estadoOptions = ['abierto', 'en_seguimiento', 'cerrado'];
  prioridadOptions = ['baja', 'media', 'alta', 'critica'];

  ngOnInit(): void {
    this.loadCasos();
  }

  loadCasos(): void {
    this.loading = true;
    this.supabase.getCasos({
      search: this.search || undefined,
      tipo: this.tipoFilter || undefined,
      estado: this.estadoFilter || undefined,
      page: this.page,
      limit: this.limit,
    }).subscribe((res: any) => {
      this.casos = res.data ?? [];
      this.total = res.count ?? 0;
      this.totalPages = Math.ceil((res.count ?? 0) / this.limit);
      this.loading = false;
    });
  }

  onSearch(): void {
    this.page = 1;
    this.loadCasos();
  }

  clearFilters(): void {
    this.search = '';
    this.tipoFilter = '';
    this.estadoFilter = '';
    this.prioridadFilter = '';
    this.desde = '';
    this.hasta = '';
    this.page = 1;
    this.loadCasos();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadCasos();
  }

  verCaso(id: number): void {
    this.router.navigate(['/casos', id]);
  }

  editarCaso(id: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/casos', id, 'editar']);
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
