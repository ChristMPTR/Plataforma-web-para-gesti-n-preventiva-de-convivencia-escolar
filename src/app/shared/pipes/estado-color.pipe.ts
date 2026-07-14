import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoColor',
  standalone: true
})
export class EstadoColorPipe implements PipeTransform {
  transform(value: string): string {
    const map: Record<string, string> = {
      'abierto': 'status-open',
      'pendiente': 'status-open',
      'en_seguimiento': 'status-tracking',
      'en_atencion': 'status-tracking',
      'cerrado': 'status-closed',
      'activo': 'status-active',
      'inactivo': 'status-inactive',
      'revisada': 'status-reviewed'
    };
    return map[value.toLowerCase()] || 'status-default';
  }
}
