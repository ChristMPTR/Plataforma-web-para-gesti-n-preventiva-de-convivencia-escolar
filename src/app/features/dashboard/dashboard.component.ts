import { Component, OnInit, AfterViewInit, OnDestroy, inject, PLATFORM_ID, ViewChild, ElementRef } from '@angular/core';
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
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
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
  private loadingTimeout: any = null;

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('chart.js').then((m) => {
        this.chartJs = m;
        // Chart.js loaded AFTER data may have arrived — retry renders
        if (this.casosPorCurso.length) this.renderBarChart();
        if (this.tendencias.length) this.renderLineChart();
      });
    }
  }

  ngOnDestroy(): void {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
    }
  }

  /** Safety net: if loading never resolves, force it off after 10s */
  private startLoadingFallback(): void {
    this.loadingTimeout = setTimeout(() => {
      if (this.loading) {
        console.warn('[Dashboard] Loading timeout — forcing loading=false');
        this.loading = false;
      }
    }, 10000);
  }

  private loadData(): void {
    this.startLoadingFallback();

    this.supabase.getDashboardStats().subscribe({
      next: (stats: any) => {
        if (stats) {
          this.stats = {
            total_casos: stats.totalCasos ?? 0,
            casos_abiertos: (stats.abiertos ?? 0) + (stats.enSeguimiento ?? 0),
            casos_cerrados: stats.cerrados ?? 0,
            reuniones_realizadas: stats.reunionesRealizadas ?? 0,
          };
        }
        this.loading = false;
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
      },
      error: (err) => {
        console.error('[Dashboard] Error loading stats:', err);
        this.loading = false;
        if (this.loadingTimeout) {
          clearTimeout(this.loadingTimeout);
          this.loadingTimeout = null;
        }
      },
    });

    this.supabase.getCasos({ page: 1, limit: 5 }).subscribe({
      next: (res: any) => {
        this.casosRecientes = res.data ?? [];
      },
      error: (err) => console.error('[Dashboard] Error loading casos recientes:', err),
    });

    this.supabase.getCasosPorCurso().subscribe({
      next: (data) => {
        this.casosPorCurso = data ?? [];
        this.renderBarChart();
      },
      error: (err) => console.error('[Dashboard] Error loading casos por curso:', err),
    });

    this.supabase.getTendenciasMensuales().subscribe({
      next: (data) => {
        this.tendencias = data ?? [];
        this.renderLineChart();
      },
      error: (err) => console.error('[Dashboard] Error loading tendencias:', err),
    });

    this.supabase.getAlertas().subscribe({
      next: (data) => {
        this.alertas = data ?? [];
      },
      error: (err) => console.error('[Dashboard] Error loading alertas:', err),
    });
  }

  private renderBarChart(): void {
    if (!this.barChartCanvas || !this.chartJs) return;
    const ctx = this.barChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const chartColors = [
      '#2e86c1', '#27ae60', '#f39c12', '#e74c3c',
      '#8e44ad', '#16a085', '#d35400', '#2c3e50',
      '#1abc9c', '#e67e22', '#9b59b6', '#3498db',
    ];
    const labels = this.casosPorCurso.map((c: any) => c.curso ?? c.nombre);
    const data = this.casosPorCurso.map((c: any) => c.cantidad ?? c.total);
    const colors = labels.map((_: any, i: number) => chartColors[i % chartColors.length]);

    // Custom plugin: draw value on top of each bar
    const valuePlugin = {
      id: 'barValueLabels',
      afterDatasetsDraw(chart: any) {
        const { ctx: c } = chart;
        chart.getDatasetMeta(0).data.forEach((bar: any, i: number) => {
          const val = chart.data.datasets[0].data[i];
          if (val === 0) return;
          c.save();
          c.font = '600 13px Inter, sans-serif';
          c.fillStyle = '#2c3e50';
          c.textAlign = 'center';
          c.textBaseline = 'bottom';
          c.fillText(val, bar.x, bar.y - 6);
          c.restore();
        });
      },
    };

    new this.chartJs.Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Casos',
          data,
          backgroundColor: colors,
          borderRadius: 8,
          borderSkipped: false,
          barThickness: 36,
          hoverBackgroundColor: colors.map((c: string) => c + 'CC'),
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 800, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2c3e50',
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: (items: any[]) => `Curso: ${items[0].label}`,
              label: (item: any) => `${item.raw} caso${item.raw !== 1 ? 's' : ''}`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f0f2f5', drawBorder: false },
            ticks: {
              stepSize: 1,
              font: { size: 12, weight: '500' },
              color: '#7f8c8d',
            },
            border: { display: false },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12, weight: '600' },
              color: '#2c3e50',
            },
            border: { display: false },
          },
        },
      },
      plugins: [valuePlugin],
    });
  }

  private renderLineChart(): void {
    if (!this.lineChartCanvas || !this.chartJs) return;
    const ctx = this.lineChartCanvas.nativeElement.getContext('2d');
    if (!ctx) return;

    const labels = this.tendencias.map((t: any) => {
      const [y, m] = (t.mes ?? t.fecha ?? '').split('-');
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      return m ? monthNames[parseInt(m, 10) - 1] + ' ' + y : t.mes ?? t.fecha;
    });
    const data = this.tendencias.map((t: any) => t.cantidad ?? t.total);

    // Create gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, 260);
    gradient.addColorStop(0, 'rgba(46, 134, 193, 0.25)');
    gradient.addColorStop(0.5, 'rgba(46, 134, 193, 0.08)');
    gradient.addColorStop(1, 'rgba(46, 134, 193, 0.01)');

    // Custom plugin: draw value above each point
    const pointValuePlugin = {
      id: 'lineValueLabels',
      afterDatasetsDraw(chart: any) {
        const { ctx: c } = chart;
        chart.getDatasetMeta(0).data.forEach((point: any, i: number) => {
          const val = chart.data.datasets[0].data[i];
          if (val === 0) return;
          c.save();
          c.font = '600 12px Inter, sans-serif';
          c.fillStyle = '#1a5276';
          c.textAlign = 'center';
          c.textBaseline = 'bottom';
          c.fillText(val, point.x, point.y - 10);
          c.restore();
        });
      },
    };

    new this.chartJs.Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Casos Mensuales',
          data,
          borderColor: '#2e86c1',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#2e86c1',
          pointBorderWidth: 2.5,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: '#2e86c1',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 1000, easing: 'easeOutQuart' },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#2c3e50',
            titleFont: { size: 13, weight: '600' },
            bodyFont: { size: 12 },
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            intersect: false,
            mode: 'index',
            callbacks: {
              title: (items: any[]) => `Período: ${items[0].label}`,
              label: (item: any) => `${item.raw} caso${item.raw !== 1 ? 's' : ''} registrado${item.raw !== 1 ? 's' : ''}`,
            },
          },
        },
        interaction: { intersect: false, mode: 'index' },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f0f2f5', drawBorder: false },
            ticks: {
              stepSize: 1,
              font: { size: 12, weight: '500' },
              color: '#7f8c8d',
            },
            border: { display: false },
          },
          x: {
            grid: { display: false },
            ticks: {
              font: { size: 12, weight: '600' },
              color: '#2c3e50',
              maxRotation: 0,
            },
            border: { display: false },
          },
        },
      },
      plugins: [pointValuePlugin],
    });
  }

  getPrioridadClass(p: string): string {
    const map: Record<string, string> = { baja: 'badge-success', media: 'badge-warning', alta: 'badge-danger', urgente: 'badge-dark', critica: 'badge-dark' };
    return map[p] ?? '';
  }

  getEstadoClass(e: string): string {
    const map: Record<string, string> = { abierto: 'badge-primary', en_proceso: 'badge-warning', en_seguimiento: 'badge-warning', cerrado: 'badge-success' };
    return map[e] ?? '';
  }
}
