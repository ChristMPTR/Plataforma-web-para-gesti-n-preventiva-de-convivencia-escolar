import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal-card" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <h3 class="modal-title">{{ title }}</h3>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="btn btn-secondary" (click)="onCancel()">Cancelar</button>
          <button class="btn btn-primary" (click)="onConfirm()">Confirmar</button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
      }
      .modal-card {
        background: #fff;
        border-radius: 12px;
        padding: 2rem;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      }
      .modal-title {
        margin: 0 0 0.75rem;
        font-size: 1.25rem;
        font-weight: 600;
        color: #1e293b;
      }
      .modal-message {
        margin: 0 0 1.5rem;
        color: #475569;
        line-height: 1.5;
      }
      .modal-actions {
        display: flex;
        gap: 0.75rem;
        justify-content: flex-end;
      }
      .btn {
        padding: 0.5rem 1.25rem;
        border-radius: 8px;
        border: none;
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s;
      }
      .btn-secondary {
        background: #e2e8f0;
        color: #475569;
      }
      .btn-secondary:hover {
        background: #cbd5e1;
      }
      .btn-primary {
        background: #3b82f6;
        color: #fff;
      }
      .btn-primary:hover {
        background: #2563eb;
      }
    `
  ]
})
export class ConfirmDialogComponent {
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Estás seguro de realizar esta acción?';

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm(): void {
    this.confirmed.emit();
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
