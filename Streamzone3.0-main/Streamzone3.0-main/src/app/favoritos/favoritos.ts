import { afterNextRender, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CapitalizePipe } from '../pipes';
import { AuthService } from '../auth';
import { FavoritesApiService } from '../services/favorites-api.service';
import { mapFavoriteToPelicula, PeliculaListaApi } from '../services/api-list.mapper';

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
  peliculasStarWars: PeliculaFavorita[] = [];
  peliculasTransformers: PeliculaFavorita[] = [];
  peliculasApi: PeliculaFavorita[] = [];
  errorApi: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private favoritesApi: FavoritesApiService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.cargarFavoritosApiDesdeBackend();
    });
  }

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

  cargarFavoritosApiDesdeBackend() {
    const user = this.authService.getUser();
    const userId = this.authService.getUserId();
    console.log('Usuario actual:', user);

    if (!userId) {
      this.peliculasApi = [];
      this.errorApi = 'Inicia sesión para ver tus favoritos de TMDB.';
      this.cdr.detectChanges();
      return;
    }

    this.favoritesApi.getByUserId(userId).subscribe({
      next: (response) => {
        const favorites = (response.favorites ?? []).map(mapFavoriteToPelicula);
        console.log('Favoritos cargados:', favorites);

        this.peliculasApi = favorites.map((f) => this.toPeliculaFavorita(f));
        this.errorApi = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al cargar favoritos:', error);
        this.peliculasApi = [];
        this.errorApi = 'No se pudieron cargar los favoritos desde el servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  eliminarFavorito(id: number) {
    const favoritosStr = localStorage.getItem('starWarsFavoritos');
    if (favoritosStr) {
      const favoritosArray = JSON.parse(favoritosStr) as number[];
      const nuevosFavoritos = favoritosArray.filter(favId => favId !== id);
      localStorage.setItem('starWarsFavoritos', JSON.stringify(nuevosFavoritos));
      this.cargarFavoritosStarWars();
      this.cdr.detectChanges();
    }
  }

  eliminarFavoritoTransformers(id: number) {
    const favoritosStr = localStorage.getItem('transformersFavoritos');
    if (favoritosStr) {
      const favoritosArray = JSON.parse(favoritosStr) as number[];
      const nuevosFavoritos = favoritosArray.filter(favId => favId !== id);
      localStorage.setItem('transformersFavoritos', JSON.stringify(nuevosFavoritos));
      this.cargarFavoritosTransformers();
      this.cdr.detectChanges();
    }
  }

  eliminarFavoritoApi(favoriteId: number) {
    this.favoritesApi.delete(favoriteId).subscribe({
      next: () => this.cargarFavoritosApiDesdeBackend(),
      error: (error) => {
        console.error('[StreamZone] Error al eliminar favorito:', error);
        alert('No se pudo eliminar el favorito.');
        this.cdr.detectChanges();
      },
    });
  }

  volverAHome() {
    this.router.navigate(['/home']);
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/logoStreamZone.png';
  }

  private toPeliculaFavorita(item: PeliculaListaApi): PeliculaFavorita {
    return {
      id: item.id,
      nombre: item.nombre,
      imagen: item.imagen,
      origen: 'api',
    };
  }
}
