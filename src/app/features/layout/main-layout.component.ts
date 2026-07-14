import { Component, signal, HostListener, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar.component';
import { TopbarComponent } from './topbar.component';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent {
  private auth = inject(AuthService);

  protected readonly sidebarOpen = signal(true);
  protected readonly isMobile = signal(false);

  constructor() {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  checkScreenSize(): void {
    const mobile = window.innerWidth < 768;
    this.isMobile.set(mobile);
    if (mobile) {
      this.sidebarOpen.set(false);
    } else {
      this.sidebarOpen.set(true);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  protected readonly pageTitle = 'Dashboard';

  get userName(): string {
    return this.auth.getCurrentUserSync()?.nombre ?? 'Usuario';
  }

  get userRole(): string {
    const rol = this.auth.getCurrentUserSync()?.rol ?? '';
    const roleLabels: Record<string, string> = {
      admin: 'Administrador',
      encargado_convivencia: 'Encargado de Convivencia',
      estudiante: 'Estudiante',
    };
    return roleLabels[rol] ?? rol;
  }

  protected onLogout(): void {
    this.auth.logout();
  }
}
