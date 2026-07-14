import { Component, Input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Input() collapsed = false;
  @Input() userPermissions: string[] = [];
  readonly toggleSidebar = output<void>();
  readonly logout = output<void>();

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '\u{1F4CA}' },
    { label: 'Casos', route: '/casos', icon: '\u{1F4CB}' },
    { label: 'Estudiantes', route: '/estudiantes', icon: '\u{1F465}' },
    { label: 'Cursos', route: '/cursos', icon: '\u{1F4DA}' },
    { label: 'Seguimientos', route: '/seguimientos', icon: '\u{1F4DD}' },
    { label: 'Reuniones', route: '/reuniones', icon: '\u{1F91D}' },
    { label: 'Reportes', route: '/reportes', icon: '\u{1F4C8}' },
    { label: 'Configuración', route: '/configuracion', icon: '\u2699\uFE0F' },
  ];

  protected readonly userName = 'Carlos Mendoza';
  protected readonly userRole = 'Encargado de Convivencia';
  protected readonly userInitials = 'CM';
}
