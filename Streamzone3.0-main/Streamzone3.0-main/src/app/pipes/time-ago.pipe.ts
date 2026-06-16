import { Pipe, PipeTransform } from '@angular/core';

/**
 * Pipe para mostrar tiempo relativo (hace X tiempo)
 * Uso: {{ fecha | timeAgo }}
 */
@Pipe({
  name: 'timeAgo',
  standalone: true
})
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string | number | null | undefined): string {
    if (!value) return '';
    
    const now = new Date();
    const date = typeof value === 'string' || typeof value === 'number' 
      ? new Date(value) 
      : value;
    
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'hace unos segundos';
    if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      return `hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    }
    if (seconds < 86400) {
      const hours = Math.floor(seconds / 3600);
      return `hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    }
    if (seconds < 604800) {
      const days = Math.floor(seconds / 86400);
      return `hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
    if (seconds < 2592000) {
      const weeks = Math.floor(seconds / 604800);
      return `hace ${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    }
    if (seconds < 31536000) {
      const months = Math.floor(seconds / 2592000);
      return `hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }
    
    const years = Math.floor(seconds / 31536000);
    return `hace ${years} ${years === 1 ? 'año' : 'años'}`;
  }
}










