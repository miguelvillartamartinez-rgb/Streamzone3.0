# Pipes de StreamZone

Esta carpeta contiene todos los pipes personalizados del proyecto StreamZone.

## Pipes Disponibles

### 1. `TruncatePipe`
Trunca texto a una longitud específica.

**Uso:**
```html
{{ texto | truncate:50 }}
{{ texto | truncate:30:'...' }}
```

**Parámetros:**
- `limit` (número, opcional): Longitud máxima del texto (default: 50)
- `trail` (string, opcional): Texto a agregar al final (default: '...')

**Ejemplo:**
```html
{{ "Este es un texto muy largo que necesita ser truncado" | truncate:20 }}
<!-- Resultado: "Este es un texto mu..." -->
```

---

### 2. `CapitalizePipe`
Capitaliza la primera letra de cada palabra.

**Uso:**
```html
{{ texto | capitalize }}
```

**Ejemplo:**
```html
{{ "juan perez" | capitalize }}
<!-- Resultado: "Juan Perez" -->

{{ "STAR WARS" | capitalize }}
<!-- Resultado: "Star Wars" -->
```

---

### 3. `InitialsPipe`
Obtiene las iniciales de un nombre.

**Uso:**
```html
{{ nombre | initials }}
{{ nombre | initials:2 }}
```

**Parámetros:**
- `maxInitials` (número, opcional): Número máximo de iniciales (default: 2)

**Ejemplo:**
```html
{{ "Juan Pérez García" | initials }}
<!-- Resultado: "JP" -->

{{ "María de los Ángeles" | initials:3 }}
<!-- Resultado: "MDA" -->
```

---

### 4. `TimeAgoPipe`
Muestra el tiempo relativo desde una fecha (ej: "hace 2 horas").

**Uso:**
```html
{{ fecha | timeAgo }}
```

**Ejemplo:**
```html
{{ new Date('2024-01-01') | timeAgo }}
<!-- Resultado: "hace 2 meses" -->

{{ '2024-12-20T10:30:00' | timeAgo }}
<!-- Resultado: "hace 3 horas" -->
```

---

### 5. `SlugPipe`
Convierte texto a formato slug (URL-friendly).

**Uso:**
```html
{{ texto | slug }}
```

**Ejemplo:**
```html
{{ "Star Wars: Episodio IV" | slug }}
<!-- Resultado: "star-wars-episodio-iv" -->

{{ "Transformers: La Era de la Extinción" | slug }}
<!-- Resultado: "transformers-la-era-de-la-extincion" -->
```

---

## Cómo Usar los Pipes

### 1. Importar en el Componente

```typescript
import { TruncatePipe, CapitalizePipe } from '../pipes';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  imports: [CommonModule, TruncatePipe, CapitalizePipe],
  // ...
})
```

### 2. Usar en el Template

```html
<h1>{{ titulo | capitalize }}</h1>
<p>{{ descripcion | truncate:100 }}</p>
```

### 3. Combinar Pipes

Puedes combinar múltiples pipes usando el operador `|`:

```html
{{ texto | capitalize | truncate:50 }}
```

**Nota:** Los pipes se ejecutan de izquierda a derecha.

---

## Crear un Nuevo Pipe

1. Crea un nuevo archivo en `src/app/pipes/`:
   ```typescript
   // mi-pipe.pipe.ts
   import { Pipe, PipeTransform } from '@angular/core';

   @Pipe({
     name: 'miPipe',
     standalone: true
   })
   export class MiPipe implements PipeTransform {
     transform(value: any, ...args: any[]): any {
       // Tu lógica aquí
       return value;
     }
   }
   ```

2. Exporta el pipe en `index.ts`:
   ```typescript
   export * from './mi-pipe.pipe';
   ```

3. Importa y usa en tus componentes.

---

## Notas Importantes

- Todos los pipes son **standalone** (compatibles con Angular 14+)
- Los pipes son **puros** por defecto (se ejecutan solo cuando cambia el valor)
- Los pipes deben manejar valores `null` o `undefined` de forma segura
- Para pipes que requieren detección de cambios manual, usa `ChangeDetectorRef`



Proyecto Streamzone – actualización
Actualizado el 7 de diciembre de 2025










