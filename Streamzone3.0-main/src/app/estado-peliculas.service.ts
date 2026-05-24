import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';

export interface EstadoPeliculasApi {
  userId: number;
  favoritosStarWars: number[];
  favoritosTransformers: number[];
  verMasTardeStarWars: number[];
  verMasTardeTransformers: number[];
}

/**
 * Servicio legado (SSR/JSON local). No se usa en Fase 5.
 * Favoritos y ver más tarde usan FavoritesApiService y WatchLaterApiService.
 */
@Injectable({
  providedIn: 'root'
})
export class EstadoPeliculasService {
  constructor(private http: HttpClient) {}

  loadInitialData(): Observable<{
    peliculas: any[];
    estado: EstadoPeliculasApi;
    usuario: any;
  }> {
    return forkJoin({
      peliculas: this.http.get<any[]>('/api/peliculas'),
      estado: this.http.get<EstadoPeliculasApi>('/api/me/estado-peliculas'),
      usuario: this.http.get<any>('/api/me')
    });
  }

  guardarEstado(estado: Partial<EstadoPeliculasApi>): Observable<EstadoPeliculasApi> {
    return this.http.post<EstadoPeliculasApi>('/api/me/estado-peliculas', estado);
  }
}








