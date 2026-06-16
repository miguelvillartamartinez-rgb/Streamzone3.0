# Guía de Integración de API Externa de Películas

## 📚 Introducción

Este proyecto incluye un servicio para consumir APIs externas de películas. El ejemplo utiliza **TMDB (The Movie Database)**, una API gratuita y muy completa.

## 🔑 Obtener API Key de TMDB

### Paso 1: Crear cuenta
1. Ve a [https://www.themoviedb.org/](https://www.themoviedb.org/)
2. Haz clic en "Únete" y crea una cuenta gratuita
3. Verifica tu email

### Paso 2: Solicitar API Key
1. Inicia sesión en tu cuenta
2. Ve a **Configuración** (Settings) > **API**
3. Haz clic en **"Request an API Key"**
4. Selecciona **"Developer"** como tipo de uso
5. Completa el formulario:
   - Tipo: Developer
   - Nombre de la aplicación: StreamZone (o el que prefieras)
   - URL: http://localhost:4200 (para desarrollo)
   - Descripción: Aplicación de streaming de películas
6. Acepta los términos y condiciones
7. Copia tu **API Key** (v3 auth)

### Paso 3: Configurar en el proyecto
1. Abre `src/app/config/api.config.ts`
2. Reemplaza `'TU_API_KEY'` con tu API key real:

```typescript
export const API_CONFIG = {
  TMDB_API_KEY: 'tu_api_key_aqui',
  // ...
};
```

3. También actualiza `src/app/services/peliculas-api.service.ts`:

```typescript
private readonly apiKey = 'tu_api_key_aqui';
```

## 🚀 Uso del Servicio

### Ejemplo básico en un componente:

```typescript
import { Component, OnInit } from '@angular/core';
import { PeliculasApiService, PeliculaTransformada } from '../services/peliculas-api.service';

@Component({
  // ...
})
export class MiComponente implements OnInit {
  peliculas: PeliculaTransformada[] = [];
  cargando = false;

  constructor(private peliculasApi: PeliculasApiService) {}

  ngOnInit() {
    this.cargarPeliculasPopulares();
  }

  cargarPeliculasPopulares() {
    this.cargando = true;
    this.peliculasApi.obtenerPeliculasPopulares().subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }

  buscarPeliculas(termino: string) {
    if (!termino.trim()) return;
    
    this.cargando = true;
    this.peliculasApi.buscarPeliculas(termino).subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.cargando = false;
      }
    });
  }
}
```

## 📋 Métodos Disponibles

### `obtenerPeliculasPopulares(pagina?, idioma?)`
Obtiene las películas más populares.

### `buscarPeliculas(termino, pagina?, idioma?)`
Busca películas por término.

### `obtenerPeliculasPorGenero(generoId, pagina?, idioma?)`
Obtiene películas por género (ej: 28 = Acción, 12 = Aventura).

### `obtenerDetallePelicula(id, idioma?)`
Obtiene detalles de una película específica.

### `obtenerPeliculasEnEstreno(pagina?, idioma?)`
Obtiene películas actualmente en estreno.

### `obtenerPeliculasMejorValoradas(pagina?, idioma?)`
Obtiene las películas mejor valoradas.

## 🎬 IDs de Géneros Comunes (TMDB)

- 28: Acción
- 12: Aventura
- 16: Animación
- 35: Comedia
- 80: Crimen
- 99: Documental
- 18: Drama
- 10751: Familia
- 14: Fantasía
- 36: Historia
- 27: Horror
- 10402: Música
- 9648: Misterio
- 10749: Romance
- 878: Ciencia Ficción
- 10770: TV Movie
- 53: Thriller
- 10752: Guerra
- 37: Western

## 🔒 Seguridad

**⚠️ IMPORTANTE**: Nunca subas tu API key a repositorios públicos. Considera:

1. **Variables de entorno**: Usa archivos `.env` (requiere configuración adicional)
2. **Backend proxy**: Crea un endpoint en tu servidor que haga las peticiones
3. **Gitignore**: Asegúrate de que los archivos con API keys estén en `.gitignore`

## 🌐 Otras APIs de Películas

Si prefieres usar otra API, puedes adaptar el servicio:

- **OMDB API**: [http://www.omdbapi.com/](http://www.omdbapi.com/)
- **RapidAPI Movies**: [https://rapidapi.com/](https://rapidapi.com/)
- **IMDb API**: Varias opciones disponibles

## 📝 Notas

- TMDB tiene límites de rate: 40 requests cada 10 segundos
- Las imágenes se cargan desde los servidores de TMDB
- El servicio maneja errores automáticamente y devuelve arrays vacíos en caso de fallo

