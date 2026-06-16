/**
 * EJEMPLO DE USO DEL SERVICIO DE API DE PELÍCULAS
 * 
 * Este archivo muestra cómo usar el servicio PeliculasApiService
 * en un componente. Puedes copiar este código y adaptarlo a tus necesidades.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PeliculasApiService, PeliculaTransformada } from './peliculas-api.service';
import { TruncatePipe } from '../pipes';

@Component({
  selector: 'app-ejemplo-api',
  standalone: true,
  imports: [CommonModule, FormsModule, TruncatePipe],
  template: `
    <div class="container">
      <h1>Películas desde API Externa</h1>
      
      <!-- Búsqueda -->
      <div class="busqueda">
        <input 
          type="text" 
          [(ngModel)]="terminoBusqueda"
          (keyup.enter)="buscarPeliculas()"
          placeholder="Buscar películas...">
        <button (click)="buscarPeliculas()">Buscar</button>
      </div>

      <!-- Botones de categorías -->
      <div class="categorias">
        <button (click)="cargarPopulares()">Populares</button>
        <button (click)="cargarEnEstreno()">En Estreno</button>
        <button (click)="cargarMejorValoradas()">Mejor Valoradas</button>
        <button (click)="cargarPorGenero(28)">Acción</button>
        <button (click)="cargarPorGenero(12)">Aventura</button>
      </div>

      <!-- Estado de carga -->
      <div *ngIf="cargando" class="cargando">
        Cargando películas...
      </div>

      <!-- Lista de películas -->
      <div *ngIf="!cargando && peliculas.length > 0" class="peliculas-grid">
        <div *ngFor="let pelicula of peliculas" class="pelicula-card">
          <img [src]="pelicula.imagen" [alt]="pelicula.nombre" 
               (error)="pelicula.imagen = 'assets/logoStreamZone.png'">
          <div class="pelicula-info">
            <h3>{{ pelicula.nombre }}</h3>
            <p class="descripcion">{{ pelicula.descripcion | truncate:100 }}</p>
            <div class="detalles">
              <span>⭐ {{ pelicula.calificacion }}/10</span>
              <span>📅 {{ pelicula.fechaLanzamiento }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje cuando no hay resultados -->
      <div *ngIf="!cargando && peliculas.length === 0" class="sin-resultados">
        <p>No se encontraron películas</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .busqueda {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
    }

    .busqueda input {
      flex: 1;
      padding: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
    }

    .busqueda button {
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .categorias {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .categorias button {
      padding: 8px 16px;
      background: #f0f0f0;
      border: 1px solid #ccc;
      border-radius: 5px;
      cursor: pointer;
    }

    .categorias button:hover {
      background: #e0e0e0;
    }

    .cargando {
      text-align: center;
      padding: 40px;
      font-size: 18px;
    }

    .peliculas-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 20px;
    }

    .pelicula-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      transition: transform 0.2s;
    }

    .pelicula-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .pelicula-card img {
      width: 100%;
      height: 350px;
      object-fit: cover;
    }

    .pelicula-info {
      padding: 15px;
    }

    .pelicula-info h3 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }

    .descripcion {
      font-size: 14px;
      color: #666;
      margin-bottom: 10px;
    }

    .detalles {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #888;
    }

    .sin-resultados {
      text-align: center;
      padding: 40px;
      color: #666;
    }
  `]
})
export class EjemploUsoApiComponent implements OnInit {
  peliculas: PeliculaTransformada[] = [];
  cargando = false;
  terminoBusqueda = '';

  constructor(private peliculasApi: PeliculasApiService) {}

  ngOnInit() {
    // Cargar películas populares al iniciar
    this.cargarPopulares();
  }

  cargarPopulares() {
    this.cargando = true;
    this.peliculasApi.obtenerPeliculasPopulares().subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar películas populares:', error);
        this.cargando = false;
      }
    });
  }

  cargarEnEstreno() {
    this.cargando = true;
    this.peliculasApi.obtenerPeliculasEnEstreno().subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar películas en estreno:', error);
        this.cargando = false;
      }
    });
  }

  cargarMejorValoradas() {
    this.cargando = true;
    this.peliculasApi.obtenerPeliculasMejorValoradas().subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar películas mejor valoradas:', error);
        this.cargando = false;
      }
    });
  }

  cargarPorGenero(generoId: number) {
    this.cargando = true;
    this.peliculasApi.obtenerPeliculasPorGenero(generoId).subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar películas por género:', error);
        this.cargando = false;
      }
    });
  }

  buscarPeliculas() {
    if (!this.terminoBusqueda.trim()) {
      this.cargarPopulares();
      return;
    }

    this.cargando = true;
    this.peliculasApi.buscarPeliculas(this.terminoBusqueda).subscribe({
      next: (peliculas) => {
        this.peliculas = peliculas;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al buscar películas:', error);
        this.cargando = false;
      }
    });
  }
}

