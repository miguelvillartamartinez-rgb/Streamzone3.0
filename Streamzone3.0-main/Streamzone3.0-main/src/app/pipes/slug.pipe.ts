import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para convertir texto a slug (URL-friendly)
 * Uso: {{ texto | slug }}
 */
@Pipe({
  name: 'slug',
  standalone: true
})
export class SlugPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina acentos
      .replace(/[^a-z0-9\s-]/g, '') // Elimina caracteres especiales
      .trim()
      .replace(/\s+/g, '-') // Reemplaza espacios con guiones
      .replace(/-+/g, '-'); // Elimina guiones múltiples
  }
}










