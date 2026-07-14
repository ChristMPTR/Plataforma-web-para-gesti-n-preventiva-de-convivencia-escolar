import { Component, Input, output, HostListener, signal } from '@angular/core';
import { SlicePipe } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [SlicePipe],
  templateUrl: './topbar.component.html',
  styleUrl: './topbar.component.scss',
})
export class TopbarComponent {
  @Input() pageTitle = '';
  @Input() userName = '';
  @Input() userRole = '';
  readonly menuToggle = output<void>();
  readonly logout = output<void>();

  protected readonly showUserMenu = signal(false);

  toggleUserMenu(): void {
    this.showUserMenu.update(v => !v);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.topbar__user')) {
      this.showUserMenu.set(false);
    }
  }

  protected readonly notifications = 3;
}
