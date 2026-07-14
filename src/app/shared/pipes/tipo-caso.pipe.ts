import { Pipe, PipeTransform } from '@angular/core';
import { TipoCaso } from '../../core/models/models';

@Pipe({
  name: 'tipoCaso',
  standalone: true
})
export class TipoCasoPipe implements PipeTransform {
  private labels: Record<TipoCaso, string> = {
    'conflicto_entre_estudiantes': 'Conflicto entre estudiantes',
    'conducta': 'Conducta',
    'convivencia': 'Convivencia',
    'acoso': 'Acoso',
    'otro': 'Otro'
  };

  transform(value: TipoCaso | string): string {
    return this.labels[value as TipoCaso] || value;
  }
}
