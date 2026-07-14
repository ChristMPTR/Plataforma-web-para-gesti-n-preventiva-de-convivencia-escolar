import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EstadoColorPipe } from '../pipes/estado-color.pipe';
import { TipoCasoPipe } from '../pipes/tipo-caso.pipe';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  pipe?: 'estadoColor' | 'tipoCaso';
}

export type DataRow = Record<string, any>;

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, FormsModule, EstadoColorPipe, TipoCasoPipe],
  template: `
    <div class="data-table-wrapper">
      <div class="data-table-toolbar" *ngIf="showSearch">
        <input
          type="text"
          class="search-input"
          placeholder="Buscar..."
          [ngModel]="searchTerm"
          (ngModelChange)="onSearchChange($event)"
        />
        <span class="search-icon">&#128269;</span>
      </div>

      <div class="table-responsive">
        <table class="data-table" [class.loading]="loading">
          <thead>
            <tr>
              <th
                *ngFor="let col of columns"
                [class.sortable]="col.sortable"
                (click)="col.sortable && toggleSort(col.key)"
              >
                {{ col.label }}
                <span *ngIf="sortColumn === col.key" class="sort-arrow">
                  {{ sortDirection === 'asc' ? '\u25B2' : '\u25BC' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr *ngIf="loading">
              <td [attr.colspan]="columns.length" class="table-message">
                <div class="spinner"></div>
                Cargando datos...
              </td>
            </tr>
            <tr *ngIf="!loading && filteredData.length === 0">
              <td [attr.colspan]="columns.length" class="table-message">
                No se encontraron registros
              </td>
            </tr>
            <tr
              *ngFor="let row of paginatedData; let i = index"
              (click)="onRowClick(row)"
              class="data-row"
            >
              <td *ngFor="let col of columns" [attr.data-label]="col.label">
                <ng-container [ngSwitch]="col.pipe">
                  <span *ngSwitchCase="'estadoColor'" [ngClass]="row[col.key] | estadoColor">
                    {{ row[col.key] }}
                  </span>
                  <span *ngSwitchCase="'tipoCaso'">
                    {{ row[col.key] | tipoCaso }}
                  </span>
                  <span *ngSwitchDefault>
                    {{ getCellValue(row[col.key]) }}
                  </span>
                </ng-container>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="table-footer" *ngIf="totalPages > 1">
        <span class="pagination-info">
          {{ startRecord }} - {{ endRecord }} de {{ filteredData.length }}
        </span>
        <div class="pagination-controls">
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(1)"
            title="Primera página"
          >
            &laquo;&laquo;
          </button>
          <button
            class="page-btn"
            [disabled]="currentPage === 1"
            (click)="goToPage(currentPage - 1)"
            title="Anterior"
          >
            &laquo;
          </button>
          <span class="page-indicator">Pág. {{ currentPage }} de {{ totalPages }}</span>
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(currentPage + 1)"
            title="Siguiente"
          >
            &raquo;
          </button>
          <button
            class="page-btn"
            [disabled]="currentPage === totalPages"
            (click)="goToPage(totalPages)"
            title="Última página"
          >
            &raquo;&raquo;
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .data-table-wrapper {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      .data-table-toolbar {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 1rem;
        position: relative;
      }
      .search-input {
        padding: 0.5rem 1rem 0.5rem 2.25rem;
        border: 1px solid #d1d5db;
        border-radius: 8px;
        font-size: 0.875rem;
        width: 260px;
        outline: none;
        transition: border-color 0.2s;
      }
      .search-input:focus {
        border-color: #3b82f6;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
      }
      .search-icon {
        position: absolute;
        right: 0.75rem;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        font-size: 0.875rem;
      }
      .table-responsive {
        overflow-x: auto;
        border-radius: 8px;
        border: 1px solid #e5e7eb;
      }
      .data-table {
        width: 100%;
        border-collapse: collapse;
        background: #fff;
      }
      .data-table thead th {
        background: #f8fafc;
        padding: 0.75rem 1rem;
        text-align: left;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        color: #64748b;
        border-bottom: 2px solid #e2e8f0;
        white-space: nowrap;
        user-select: none;
      }
      .data-table thead th.sortable {
        cursor: pointer;
      }
      .data-table thead th.sortable:hover {
        background: #f1f5f9;
      }
      .sort-arrow {
        margin-left: 0.25rem;
        font-size: 0.625rem;
        color: #3b82f6;
      }
      .data-table tbody td {
        padding: 0.75rem 1rem;
        font-size: 0.875rem;
        color: #334155;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }
      .data-row {
        transition: background 0.15s;
      }
      .data-row:hover {
        background: #f8fafc;
        cursor: pointer;
      }
      .table-message {
        text-align: center;
        padding: 2rem !important;
        color: #94a3b8;
        font-size: 0.875rem;
      }
      .loading {
        opacity: 0.6;
      }
      .spinner {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        border: 2px solid #e2e8f0;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        margin-right: 0.5rem;
        vertical-align: middle;
      }
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
      .table-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        font-size: 0.8125rem;
        color: #64748b;
      }
      .pagination-controls {
        display: flex;
        align-items: center;
        gap: 0.25rem;
      }
      .page-btn {
        padding: 0.375rem 0.625rem;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        background: #fff;
        color: #475569;
        font-size: 0.75rem;
        cursor: pointer;
        transition: all 0.15s;
      }
      .page-btn:hover:not(:disabled) {
        background: #f1f5f9;
        border-color: #cbd5e1;
      }
      .page-btn:disabled {
        opacity: 0.4;
        cursor: default;
      }
      .page-indicator {
        margin: 0 0.5rem;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .data-table thead {
          display: none;
        }
        .data-table tbody td {
          display: block;
          padding: 0.5rem 1rem;
          border: none;
        }
        .data-table tbody td::before {
          content: attr(data-label);
          display: block;
          font-size: 0.6875rem;
          font-weight: 600;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 0.25rem;
        }
        .data-row {
          display: block;
          border-bottom: 2px solid #e5e7eb;
          padding: 0.5rem 0;
        }
        .table-footer {
          flex-direction: column;
          gap: 0.5rem;
          align-items: center;
        }
      }
    `
  ]
})
export class DataTableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() set data(value: DataRow[]) {
    this._data = value;
    this.applyFilter();
  }
  get data(): DataRow[] {
    return this._data;
  }
  @Input() loading = false;
  @Input() pageSize = 10;
  @Input() showSearch = true;

  @Output() rowClick = new EventEmitter<DataRow>();

  _data: DataRow[] = [];
  searchTerm = '';
  filteredData: DataRow[] = [];
  sortColumn = '';
  sortDirection: 'asc' | 'desc' = 'asc';
  currentPage = 1;

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize) || 1;
  }

  get startRecord(): number {
    return this.filteredData.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecord(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredData.length);
  }

  get paginatedData(): DataRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.currentPage = 1;
    this.applyFilter();
  }

  private applyFilter(): void {
    let data = [...this._data];

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      data = data.filter(row =>
        this.columns.some(col => {
          const val = row[col.key];
          return val != null && String(val).toLowerCase().includes(term);
        })
      );
    }

    if (this.sortColumn) {
      data.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        const cmp = String(aVal).localeCompare(String(bVal), 'es', { numeric: true });
        return this.sortDirection === 'asc' ? cmp : -cmp;
      });
    }

    this.filteredData = data;
  }

  toggleSort(key: string): void {
    if (this.sortColumn === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = key;
      this.sortDirection = 'asc';
    }
    this.currentPage = 1;
    this.applyFilter();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onRowClick(row: DataRow): void {
    this.rowClick.emit(row);
  }

  getCellValue(value: unknown): string {
    if (value === null || value === undefined) return '-';
    return String(value);
  }
}
