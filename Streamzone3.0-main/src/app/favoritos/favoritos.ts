import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CapitalizePipe } from '../pipes';

interface PeliculaFavorita {
  id: number;
  nombre: string;
  imagen: string;
  origen: 'local' | 'api';
}

@Component({
  selector: 'app-favoritos',
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  templateUrl: './favoritos.html',
  styleUrls: ['./favoritos.css']
})
export class Favoritos implements OnInit {
  private readonly API_FAVORITOS_DATA_KEY = 'apiFavoritosData';

  peliculasStarWars: PeliculaFavorita[] = [];
  peliculasTransformers: PeliculaFavorita[] = [];
  peliculasApi: PeliculaFavorita[] = [];

  constructor(private router: Router) {}
  nombresStarWars: string[] = [
    'Star Wars: Episodio I - La Amenaza Fantasma',
    'Star Wars: Episodio II - El Ataque de los Clones',
    'Star Wars: Episodio III - La Venganza de los Sith',
    'Star Wars: Episodio IV - Una Nueva Esperanza',
    'Star Wars: Episodio V - El Imperio Contraataca',
    'Star Wars: Episodio VI - El Retorno del Jedi',
    'Star Wars: Episodio VII - El Despertar de la Fuerza',
    'Star Wars: Episodio VIII - Los Últimos Jedi',
    'Star Wars: Episodio IX - El Ascenso de Skywalker'
  ];
  nombresTransformers: string[] = [
    'Transformers: La Era de la Extinción',
    'Transformers: La Guerra de los Autobots',
    'Transformers: La Batalla de Cybertron',
    'Transformers: La Guerra de los Autobots',
    'Transformers: La Batalla de Cybertron',
    'Transformers: La Guerra de los Autobots',
    'Transformers: La Batalla de Cybertron'
  ];

  ngOnInit() {
    this.cargarFavoritosStarWars();
    this.cargarFavoritosTransformers();
    this.cargarFavoritosApi();
  }

  cargarFavoritosStarWars() {
    this.peliculasStarWars = [];
    const favoritosStr = localStorage.getItem('starWarsFavoritos');
    if (favoritosStr) {
      const favoritosArray = JSON.parse(favoritosStr) as number[];
      this.peliculasStarWars = favoritosArray.map(id => ({
        id: id,
        nombre: this.nombresStarWars[id - 1] || `Star Wars ${id}`,
        imagen: `assets/StarWars${id}.png`,
        origen: 'local'
      }));
    }
  }

  cargarFavoritosTransformers() {
    this.peliculasTransformers = [];
    const favoritosStr = localStorage.getItem('transformersFavoritos');
    if (favoritosStr) {
      const favoritosArray = JSON.parse(favoritosStr) as number[];
      this.peliculasTransformers = favoritosArray.map(id => ({
        id: id,
        nombre: this.nombresTransformers[id - 1] || `Transformers ${id}`,
        imagen: `assets/Transformers${id}.png`,
        origen: 'local'
      }));
    }
  }

  cargarFavoritosApi() {
    const favoritosApi = this.obtenerArrayDesdeStorage<PeliculaFavorita>(this.API_FAVORITOS_DATA_KEY);
    this.peliculasApi = favoritosApi.map((pelicula) => ({
      ...pelicula,
      origen: 'api'
    }));
  }

  eliminarFavorito(id: number) {
    const favoritosStr = localStorage.getItem('starWarsFavoritos');
    if (favoritosStr) {
      const favoritosArray = JSON.parse(favoritosStr) as number[];
      const nuevosFavoritos = favoritosArray.filter(favId => favId !== id);
      localStorage.setItem('starWarsFavoritos', JSON.stringify(nuevosFavoritos));
      this.cargarFavoritosStarWars();
    }
  }

  eliminarFavoritoTransformers(id: number) {
    const favoritosStr = localStorage.getItem('transformersFavoritos');
    if (favoritosStr) {
      const favoritosArray = JSON.parse(favoritosStr) as number[];
      const nuevosFavoritos = favoritosArray.filter(favId => favId !== id);
      localStorage.setItem('transformersFavoritos', JSON.stringify(nuevosFavoritos));
      this.cargarFavoritosTransformers();
    }
  }

  eliminarFavoritoApi(id: number) {
    const favoritosIds = this.obtenerArrayDesdeStorage<number>('apiFavoritos');
    const nuevosIds = favoritosIds.filter((favId) => favId !== id);
    localStorage.setItem('apiFavoritos', JSON.stringify(nuevosIds));

    const detalle = this.obtenerArrayDesdeStorage<PeliculaFavorita>(this.API_FAVORITOS_DATA_KEY);
    const nuevoDetalle = detalle.filter((pelicula) => pelicula.id !== id);
    localStorage.setItem(this.API_FAVORITOS_DATA_KEY, JSON.stringify(nuevoDetalle));

    this.cargarFavoritosApi();
  }

  volverAHome() {
    this.router.navigate(['/home']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/logoStreamZone.png';
  }

  private obtenerArrayDesdeStorage<T>(key: string): T[] {
    const valor = localStorage.getItem(key);
    if (!valor) {
      return [];
    }

    try {
      const parsed = JSON.parse(valor);
      return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      return [];
    }
  }
}
