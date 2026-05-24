import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

// Interfaces para la respuesta de TMDB API
export interface PeliculaAPI {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
}

export interface RespuestaAPI {
  page: number;
  results: PeliculaAPI[];
  total_pages: number;
  total_results: number;
}

// Interface para películas transformadas a nuestro formato
export interface PeliculaTransformada {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
  fechaLanzamiento: string;
  calificacion: number;
  votos: number;
  /** Path relativo TMDB (ej. /abc.jpg) para enviar al backend */
  poster_path: string | null;
  /** Fecha ISO para PostgreSQL; null si no existe */
  release_date: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class PeliculasApiService {
  private http = inject(HttpClient);
  
  // URL base de TMDB API
  private readonly baseUrl = API_CONFIG.TMDB_BASE_URL;
  
  // IMPORTANTE: Reemplaza 'TU_API_KEY' en api.config.ts con tu API key de TMDB
  // Obtén una gratis en: https://www.themoviedb.org/settings/api
  private readonly apiKey = API_CONFIG.TMDB_API_KEY;
  
  // URL base para las imágenes de TMDB
  private readonly imageBaseUrl = API_CONFIG.TMDB_IMAGE_BASE_URL;

  /**
   * Obtiene películas populares
   * @param pagina Número de página (por defecto 1)
   * @param idioma Idioma de los resultados (por defecto 'es-ES')
   */
  obtenerPeliculasPopulares(pagina: number = 1, idioma: string = 'es-ES'): Observable<PeliculaTransformada[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', idioma)
      .set('page', pagina.toString());

    return this.http.get<RespuestaAPI>(`${this.baseUrl}/movie/popular`, { params })
      .pipe(
        map(respuesta => this.transformarPeliculas(respuesta.results)),
        catchError(error => {
          console.error('Error al obtener películas populares:', error);
          return of([]);
        })
      );
  }

  /**
   * Busca películas por término
   * @param termino Término de búsqueda
   * @param pagina Número de página (por defecto 1)
   * @param idioma Idioma de los resultados (por defecto 'es-ES')
   */
  buscarPeliculas(termino: string, pagina: number = 1, idioma: string = 'es-ES'): Observable<PeliculaTransformada[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', termino)
      .set('language', idioma)
      .set('page', pagina.toString());

    return this.http.get<RespuestaAPI>(`${this.baseUrl}/search/movie`, { params })
      .pipe(
        map(respuesta => this.transformarPeliculas(respuesta.results)),
        catchError(error => {
          console.error('Error al buscar películas:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene películas por género
   * @param generoId ID del género
   * @param pagina Número de página (por defecto 1)
   * @param idioma Idioma de los resultados (por defecto 'es-ES')
   */
  obtenerPeliculasPorGenero(generoId: number, pagina: number = 1, idioma: string = 'es-ES'): Observable<PeliculaTransformada[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('with_genres', generoId.toString())
      .set('language', idioma)
      .set('page', pagina.toString());

    return this.http.get<RespuestaAPI>(`${this.baseUrl}/discover/movie`, { params })
      .pipe(
        map(respuesta => this.transformarPeliculas(respuesta.results)),
        catchError(error => {
          console.error('Error al obtener películas por género:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene detalles de una película específica
   * @param id ID de la película
   * @param idioma Idioma de los resultados (por defecto 'es-ES')
   */
  obtenerDetallePelicula(id: number, idioma: string = 'es-ES'): Observable<PeliculaTransformada | null> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', idioma);

    return this.http.get<PeliculaAPI>(`${this.baseUrl}/movie/${id}`, { params })
      .pipe(
        map(pelicula => this.transformarPelicula(pelicula)),
        catchError(error => {
          console.error(`Error al obtener detalle de película ${id}:`, error);
          return of(null);
        })
      );
  }

  /**
   * Obtiene películas en estreno
   * @param pagina Número de página (por defecto 1)
   * @param idioma Idioma de los resultados (por defecto 'es-ES')
   */
  obtenerPeliculasEnEstreno(pagina: number = 1, idioma: string = 'es-ES'): Observable<PeliculaTransformada[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', idioma)
      .set('page', pagina.toString());

    return this.http.get<RespuestaAPI>(`${this.baseUrl}/movie/now_playing`, { params })
      .pipe(
        map(respuesta => this.transformarPeliculas(respuesta.results)),
        catchError(error => {
          console.error('Error al obtener películas en estreno:', error);
          return of([]);
        })
      );
  }

  /**
   * Obtiene películas mejor valoradas
   * @param pagina Número de página (por defecto 1)
   * @param idioma Idioma de los resultados (por defecto 'es-ES')
   */
  obtenerPeliculasMejorValoradas(pagina: number = 1, idioma: string = 'es-ES'): Observable<PeliculaTransformada[]> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('language', idioma)
      .set('page', pagina.toString());

    return this.http.get<RespuestaAPI>(`${this.baseUrl}/movie/top_rated`, { params })
      .pipe(
        map(respuesta => this.transformarPeliculas(respuesta.results)),
        catchError(error => {
          console.error('Error al obtener películas mejor valoradas:', error);
          return of([]);
        })
      );
  }

  /**
   * Transforma una película de la API a nuestro formato
   */
  private transformarPelicula(
    pelicula: PeliculaAPI & { name?: string; first_air_date?: string }
  ): PeliculaTransformada {
    const title = (pelicula.title || pelicula.name || 'Sin título').trim();
    const releaseDate = pelicula.release_date || pelicula.first_air_date || null;

    return {
      id: pelicula.id,
      nombre: title,
      descripcion: pelicula.overview ?? '',
      imagen: pelicula.poster_path
        ? `${this.imageBaseUrl}${pelicula.poster_path}`
        : 'assets/logoStreamZone.png',
      fechaLanzamiento: releaseDate || 'Fecha no disponible',
      poster_path: pelicula.poster_path,
      release_date: releaseDate,
      calificacion: pelicula.vote_average,
      votos: pelicula.vote_count,
    };
  }

  /**
   * Transforma un array de películas de la API a nuestro formato
   */
  private transformarPeliculas(peliculas: PeliculaAPI[]): PeliculaTransformada[] {
    return peliculas.map(pelicula => this.transformarPelicula(pelicula));
  }
}

