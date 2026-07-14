import { Component, OnInit, AfterViewInit, inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private supabase = inject(SupabaseService);
  private platformId = inject(PLATFORM_ID);
  @ViewChild('barChart') barChartCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart') lineChartCanvas!: ElementRef<HTMLCanvasElement>;

  loading = true;
  stats: any = { total_casos: 0, casos_abiertos: 0, casos_cerrados: 0, reuniones_realizadas: 0 };
  casosPorCurso: any[] = [];
  tendencias: any[] = [];
  alertas: any[] = [];
  casosRecientes: any[] = [];
  today = new Date();

  private chartJs: any;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('chart.js').then((m) => {
        this.chartJs = m;
      });
    }
  }

  private loadData(): void {
    this.supabase.getDashboardStats().subscribe((stats: any) => {
      if (stats) {
        this.stats = {
          total_casos: stats.totalCasos ?? 0,
          casos_abiertos: (stats.abiertos ?? 0) + (stats.enSeguimiento ?? 0),
          casos_cerrados: stats.cerrados ?? 0,
          reuniones_realizadas: stats.reunionesRealizadas ?? 0,
        };
      }
      this.loading = false;
    });

    this.supabase.getCasos({ page: 1, limit: 5 }).subscribe((res: any) => {
      this.casosRecientes = res.data ?? [];
    });

    this.supabase.getCasosPorCurso().subscribe((data) => {
      this.casosPorCurso = data ?? [];
      this.renderBarChart();
    });

    this.supabase.getTendenciasMensuales().subscribe((data) => {
      this.tendencias = data ?? [];
      this.renderLineChart();
    });

    this.supabase.getAlertas().subscribe((data) => {
      this.alertas = data ?? [];
    });
  }

  private renderBarChart(): void {
    if (!this.barChartCanvas || !this.chartJs) return;
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    new this.chartJs.Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.casosPorCurso.map((c: any) => c.curso ?? c.nombre),
        datasets: [{
          label: 'Casos',
          data: this.casosPorCurso.map((c: any) => c.cantidad ?? c.total),
          backgroundColor: '#2e86c1',
          borderRadius: 6,
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#e9ecef' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  private renderLineChart(): void {
    if (!this.lineChartCanvas || !this.chartJs) return;
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;
    new this.chartJs.Chart(ctx, {
      type: 'line',
      data: {
        labels: this.tendencias.map((t: any) => t.mes ?? t.fecha),
        datasets: [{
          label: 'Tendencia Mensual',
          data: this.tendencias.map((t: any) => t.cantidad ?? t.total),
          borderColor: '#27ae60',
          backgroundColor: 'rgba(39, 174, 96, 0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#27ae60',
        }],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#e9ecef' } },
          x: { grid: { display: false } },
        },
      },
    });
  }

  getPrioridadClass(p: string): string {
    const map: Record<string, string> = { baja: 'badge-success', media: 'badge-warning', alta: 'badge-danger', critica: 'badge-dark' };
    return map[p] ?? '';
  }

  getEstadoClass(e: string): string {
    const map: Record<string, string> = { abierto: 'badge-primary', en_proceso: 'badge-warning', en_seguimiento: 'badge-warning', cerrado: 'badge-success' };
    return map[e] ?? '';
  }
}
