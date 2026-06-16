import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para capitalizar la primera letra de cada palabra
 * Uso: {{ texto | capitalize }}
 */
@Pipe({
  name: 'capitalize',
  standalone: true
})
export class CapitalizePipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    return value
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}










