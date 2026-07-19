import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { MainLayoutComponent } from './features/layout/main-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent, title: 'Iniciar Sesión — Nexora' },
  { path: 'register', component: RegisterComponent, title: 'Crear Cuenta — Nexora' },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
        title: 'Dashboard — Nexora',
      },
      {
        path: 'casos',
        loadComponent: () => import('./features/casos/casos.component').then(m => m.CasosComponent),
        title: 'Casos — Nexora',
      },
      {
        path: 'casos/nuevo',
        loadComponent: () => import('./features/casos/caso-form.component').then(m => m.CasoFormComponent),
        title: 'Nuevo Caso — Nexora',
      },
      {
        path: 'casos/:id/editar',
        loadComponent: () => import('./features/casos/caso-form.component').then(m => m.CasoFormComponent),
        title: 'Editar Caso — Nexora',
      },
      {
        path: 'casos/:id',
        loadComponent: () => import('./features/casos/caso-detail.component').then(m => m.CasoDetailComponent),
        title: 'Detalle del Caso — Nexora',
      },
      {
        path: 'estudiantes',
        loadComponent: () => import('./features/estudiantes/estudiantes.component').then(m => m.EstudiantesComponent),
        title: 'Estudiantes — Nexora',
      },
      {
        path: 'cursos',
        loadComponent: () => import('./features/cursos/cursos.component').then(m => m.CursosComponent),
        title: 'Cursos — Nexora',
      },
      {
        path: 'seguimientos',
        loadComponent: () => import('./features/seguimientos/seguimientos.component').then(m => m.SeguimientosComponent),
        title: 'Seguimientos — Nexora',
      },
      {
        path: 'reuniones',
        loadComponent: () => import('./features/reuniones/reuniones.component').then(m => m.ReunionesComponent),
        title: 'Reuniones — Nexora',
      },
      {
        path: 'reportes',
        loadComponent: () => import('./features/reportes/reportes.component').then(m => m.ReportesComponent),
        title: 'Reportes — Nexora',
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/configuracion/configuracion.component').then(m => m.ConfiguracionComponent),
        title: 'Configuración — Nexora',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
