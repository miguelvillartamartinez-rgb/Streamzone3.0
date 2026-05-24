import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para truncar texto a una longitud específica
 * Uso: {{ texto | truncate:50 }} o {{ texto | truncate:30:'...' }}
 */
@Pipe({
  name: 'truncate',
  standalone: true
})
export class TruncatePipe implements PipeTransform {
  transform(value: string | null | undefined, limit: number = 50, trail: string = '...'): string {
    if (!value) return '';
    if (value.length <= limit) return value;
    return value.substring(0, limit) + trail;
  }
}










