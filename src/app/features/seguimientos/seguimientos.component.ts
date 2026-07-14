import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { Seguimiento } from '../../core/models/models';

@Component({
  selector: 'app-seguimientos',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './seguimientos.component.html',
  styleUrl: './seguimientos.component.scss',
})
export class SeguimientosComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  seguimientos: any[] = [];
  loading = true;
  total = 0;
  page = 1;
  limit = 10;
  totalPages = 0;

  desde = '';
  hasta = '';
  responsable = '';

  ngOnInit(): void {
    this.loadSeguimientos();
  }

  loadSeguimientos(): void {
    this.loading = true;
    this.supabase.getSeguimientos({
      desde: this.desde || undefined,
      hasta: this.hasta || undefined,
      responsable: this.responsable || undefined,
      page: this.page,
      limit: this.limit,
    }).subscribe((res) => {
      this.seguimientos = res.data;
      this.total = res.count;
      this.totalPages = Math.ceil(res.count / this.limit);
      this.loading = false;
    });
  }

  onFilter(): void {
    this.page = 1;
    this.loadSeguimientos();
  }

  changePage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.loadSeguimientos();
  }

  verCaso(casoId: number): void {
    this.router.navigate(['/casos', casoId]);
  }
}
