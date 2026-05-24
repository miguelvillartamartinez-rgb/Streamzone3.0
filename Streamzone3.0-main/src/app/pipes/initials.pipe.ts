import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para obtener las iniciales de un nombre
 * Uso: {{ nombre | initials }} o {{ nombre | initials:2 }}
 */
@Pipe({
  name: 'initials',
  standalone: true
})
export class InitialsPipe implements PipeTransform {
  transform(value: string | null | undefined, maxInitials: number = 2): string {
    if (!value) return '';
    
    const words = value.trim().split(/\s+/);
    const initials = words
      .slice(0, maxInitials)
      .map(word => word.charAt(0).toUpperCase())
      .join('');
    
    return initials;
  }
}










