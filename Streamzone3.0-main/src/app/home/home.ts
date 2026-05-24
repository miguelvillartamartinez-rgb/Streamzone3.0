import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { TruncatePipe, CapitalizePipe } from '../pipes';
import { PeliculasApiService, PeliculaTransformada } from '../services/peliculas-api.service';
import { FavoritesApiService } from '../services/favorites-api.service';
import { WatchLaterApiService } from '../services/watch-later-api.service';
import { toAddMovieListPayload } from '../services/api-movie.helper';
import { SessionUser } from '../models/backend-api.models';

interface PeliculaGuardadaApi {
  id: number;
  nombre: string;
  imagen: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TruncatePipe, CapitalizePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../app.css']
})
export class Home implements OnInit {
  // Fallback temporal: catálogo local Star Wars / Transformers sin tmdb_id en backend
  private readonly API_FAVORITOS_KEY = 'apiFavoritos';
  private readonly API_VER_MAS_TARDE_KEY = 'apiVerMasTarde';
  private readonly API_FAVORITOS_DATA_KEY = 'apiFavoritosData';
  private readonly API_VER_MAS_TARDE_DATA_KEY = 'apiVerMasTardeData';

  user: SessionUser | null = null;
  terminoBusqueda: string = '';
  imagenesSt: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  imagenesTransformers: number[] = [1, 2, 3, 4, 5, 6, 7];
  imagenesStFiltradas: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  imagenesTransformersFiltradas: number[] = [1, 2, 3, 4, 5, 6, 7];
  
  peliculasAPI: PeliculaTransformada[] = [];
  peliculasAPIFiltradas: PeliculaTransformada[] = [];
  cargandoAPI: boolean = false;
  errorAPI: string = '';
  usarAPI: boolean = false;
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
  favoritosStarWars: Set<number> = new Set();
  favoritosTransformers: Set<number> = new Set();
  favoritosAPI: Set<number> = new Set();
  verMasTardeStarWars: Set<number> = new Set();
  verMasTardeTransformers: Set<number> = new Set();
  verMasTardeAPI: Set<number> = new Set();

  /** Mapa tmdb_id -> id de fila en favorites (PostgreSQL) */
  private favoriteIdByTmdb = new Map<number, number>();
  /** Mapa tmdb_id -> id de fila en watch_later (PostgreSQL) */
  private watchLaterIdByTmdb = new Map<number, number>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private peliculasApi: PeliculasApiService,
    private favoritesApi: FavoritesApiService,
    private watchLaterApi: WatchLaterApiService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.cargarFavoritosLocales();
    this.cargarVerMasTardeLocales();
    this.cargarFavoritosApiDesdeBackend();
    this.cargarVerMasTardeApiDesdeBackend();
    this.filtrarPeliculas();
    this.cargarPeliculasPopularesAPI();
  }

  filtrarPeliculas() {
    if (!this.terminoBusqueda.trim()) {
      this.imagenesStFiltradas = [...this.imagenesSt];
      this.imagenesTransformersFiltradas = [...this.imagenesTransformers];
      if (this.usarAPI) {
        this.peliculasAPIFiltradas = [...this.peliculasAPI];
      }
      return;
    }

    if (this.usarAPI) {
      if (this.terminoBusqueda.trim().length >= 2) {
        this.buscarEnAPI(this.terminoBusqueda);
      } else {
        this.peliculasAPIFiltradas = [];
      }
      this.imagenesStFiltradas = [];
      this.imagenesTransformersFiltradas = [];
      return;
    }

    const termino = this.normalizarTexto(this.terminoBusqueda);
    
    const buscaStarWars = termino.includes('star') && termino.includes('wars') || 
                          termino.includes('starwars') ||
                          termino.startsWith('star wars') ||
                          termino === 'star' ||
                          termino === 'wars';
    
    const buscaTransformers = termino.includes('transformers') ||
                              termino.includes('transformer') ||
                              termino.startsWith('transformer');

    if (buscaStarWars && !buscaTransformers) {
      this.imagenesStFiltradas = [...this.imagenesSt];
      this.imagenesTransformersFiltradas = [];
      return;
    }

    if (buscaTransformers && !buscaStarWars) {
      this.imagenesStFiltradas = [];
      this.imagenesTransformersFiltradas = [...this.imagenesTransformers];
      return;
    }

    if (buscaStarWars && buscaTransformers) {
      this.imagenesStFiltradas = [...this.imagenesSt];
      this.imagenesTransformersFiltradas = [...this.imagenesTransformers];
      return;
    }

    const terminoNormalizado = termino;
    
    const coincidenciasExactasStarWars = this.imagenesSt.filter(i => 
      this.normalizarTexto(this.getNombreStarWars(i)) === terminoNormalizado
    );
    if (coincidenciasExactasStarWars.length > 0) {
      this.imagenesStFiltradas = coincidenciasExactasStarWars;
    } else {
      this.imagenesStFiltradas = this.imagenesSt.filter(i => {
        const nombreNormalizado = this.normalizarTexto(this.getNombreStarWars(i));
        
        const palabrasTermino = terminoNormalizado.split(' ').filter(p => p.length > 0);
        const palabrasNombre = nombreNormalizado.split(' ');
        return palabrasTermino.every(palabraTermino => 
          palabrasNombre.some(palabraNombre => 
            palabraNombre.includes(palabraTermino) || palabraTermino.includes(palabraNombre)
          )
        ) || nombreNormalizado.includes(terminoNormalizado);
      });
    }

    const coincidenciasExactasTransformers = this.imagenesTransformers.filter(i => 
      this.normalizarTexto(this.getNombreTransformers(i)) === terminoNormalizado
    );
    if (coincidenciasExactasTransformers.length > 0) {
      this.imagenesTransformersFiltradas = coincidenciasExactasTransformers;
    } else {
      this.imagenesTransformersFiltradas = this.imagenesTransformers.filter(i => {
        const nombreNormalizado = this.normalizarTexto(this.getNombreTransformers(i));
        const palabrasTermino = terminoNormalizado.split(' ').filter(p => p.length > 0);
        const palabrasNombre = nombreNormalizado.split(' ');
        return palabrasTermino.every(palabraTermino => 
          palabrasNombre.some(palabraNombre => 
            palabraNombre.includes(palabraTermino) || palabraTermino.includes(palabraNombre)
          )
        ) || nombreNormalizado.includes(terminoNormalizado);
      });
    }
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /** Catálogo local Star Wars / Transformers (localStorage) */
  cargarFavoritosLocales() {
    this.favoritosStarWars = this.obtenerSetDesdeStorage('starWarsFavoritos');
    this.favoritosTransformers = this.obtenerSetDesdeStorage('transformersFavoritos');
  }

  guardarFavoritosStarWars() {
    this.guardarSetEnStorage('starWarsFavoritos', this.favoritosStarWars);
  }

  guardarFavoritosTransformers() {
    this.guardarSetEnStorage('transformersFavoritos', this.favoritosTransformers);
  }

  toggleFavoritoStarWars(num: number) {
    this.toggleEnSet(num, this.favoritosStarWars);
    this.guardarFavoritosStarWars();
  }

  toggleFavoritoTransformers(num: number) {
    this.toggleEnSet(num, this.favoritosTransformers);
    this.guardarFavoritosTransformers();
  }

  esFavoritoStarWars(num: number): boolean {
    return this.favoritosStarWars.has(num);
  }

  esFavoritoTransformers(num: number): boolean {
    return this.favoritosTransformers.has(num);
  }

  cargarVerMasTardeLocales() {
    this.verMasTardeStarWars = this.obtenerSetDesdeStorage('starWarsVerMasTarde');
    this.verMasTardeTransformers = this.obtenerSetDesdeStorage('transformersVerMasTarde');
  }

  guardarVerMasTardeStarWars() {
    this.guardarSetEnStorage('starWarsVerMasTarde', this.verMasTardeStarWars);
  }

  guardarVerMasTardeTransformers() {
    this.guardarSetEnStorage('transformersVerMasTarde', this.verMasTardeTransformers);
  }

  toggleVerMasTardeStarWars(num: number) {
    this.toggleEnSet(num, this.verMasTardeStarWars);
    this.guardarVerMasTardeStarWars();
  }

  toggleVerMasTardeTransformers(num: number) {
    this.toggleEnSet(num, this.verMasTardeTransformers);
    this.guardarVerMasTardeTransformers();
  }

  estaEnVerMasTardeStarWars(num: number): boolean {
    return this.verMasTardeStarWars.has(num);
  }

  estaEnVerMasTardeTransformers(num: number): boolean {
    return this.verMasTardeTransformers.has(num);
  }

  cargarFavoritosApiDesdeBackend() {
    const userId = this.user?.id;
    if (!userId) {
      this.favoritosAPI = this.obtenerSetDesdeStorage(this.API_FAVORITOS_KEY);
      return;
    }

    this.favoritesApi.getByUserId(userId).subscribe({
      next: (response) => {
        this.favoritosAPI = new Set();
        this.favoriteIdByTmdb.clear();
        response.favorites.forEach((fav) => {
          this.favoritosAPI.add(fav.movie.tmdb_id);
          this.favoriteIdByTmdb.set(fav.movie.tmdb_id, fav.id);
        });
      },
      error: (error) => {
        console.warn('No se pudieron cargar favoritos desde API. Usando localStorage.', error);
        this.favoritosAPI = this.obtenerSetDesdeStorage(this.API_FAVORITOS_KEY);
      },
    });
  }

  cargarVerMasTardeApiDesdeBackend() {
    const userId = this.user?.id;
    if (!userId) {
      this.verMasTardeAPI = this.obtenerSetDesdeStorage(this.API_VER_MAS_TARDE_KEY);
      return;
    }

    this.watchLaterApi.getByUserId(userId).subscribe({
      next: (response) => {
        this.verMasTardeAPI = new Set();
        this.watchLaterIdByTmdb.clear();
        response.watch_later.forEach((item) => {
          this.verMasTardeAPI.add(item.movie.tmdb_id);
          this.watchLaterIdByTmdb.set(item.movie.tmdb_id, item.id);
        });
      },
      error: (error) => {
        console.warn('No se pudo cargar ver más tarde desde API. Usando localStorage.', error);
        this.verMasTardeAPI = this.obtenerSetDesdeStorage(this.API_VER_MAS_TARDE_KEY);
      },
    });
  }

  getImagenStPath(num: number): string {
    return `assets/StarWars${num}.png`;
  }

  getNombreStarWars(num: number): string {
    return this.nombresStarWars[num - 1] || `Star Wars ${num}`;
  }

  getImagenTransformersPath(num: number): string {
    return `assets/Transformers${num}.png`;
  }

  getNombreTransformers(num: number): string {
    return this.nombresTransformers[num - 1] || `Transformers ${num}`;
  }

  private obtenerSetDesdeStorage(key: string): Set<number> {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return new Set();
    }

    try {
      const parsed = JSON.parse(stored) as number[];
      return new Set(parsed);
    } catch {
      return new Set();
    }
  }

  private guardarSetEnStorage(key: string, valores: Set<number>) {
    localStorage.setItem(key, JSON.stringify(Array.from(valores)));
  }

  private toggleEnSet(valor: number, set: Set<number>) {
    if (set.has(valor)) {
      set.delete(valor);
    } else {
      set.add(valor);
    }
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/logoStreamZone.png';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  cargarPeliculasPopularesAPI() {
    this.errorAPI = '';
    this.cargandoAPI = true;
    this.peliculasApi.obtenerPeliculasPopulares(1, 'es-ES').subscribe({
      next: (peliculas) => {
        this.peliculasAPI = peliculas;
        this.peliculasAPIFiltradas = peliculas;
        if (peliculas.length === 0) {
          this.errorAPI = 'No se pudieron cargar películas de la API en este momento.';
        }
        this.cargandoAPI = false;
      },
      error: (error) => {
        console.error('Error al cargar películas de la API:', error);
        this.cargandoAPI = false;
        this.errorAPI = 'No se pudo conectar con la API externa. Mostrando catálogo local.';
        this.usarAPI = false;
      }
    });
  }

  buscarEnAPI(termino: string) {
    if (!termino.trim() || termino.length < 2) {
      this.peliculasAPIFiltradas = [...this.peliculasAPI];
      return;
    }
    this.errorAPI = '';
    this.cargandoAPI = true;
    this.peliculasApi.buscarPeliculas(termino, 1, 'es-ES').subscribe({
      next: (peliculas) => {
        this.peliculasAPIFiltradas = peliculas;
        this.cargandoAPI = false;
      },
      error: (error) => {
        console.error('Error al buscar en la API:', error);
        this.cargandoAPI = false;
        this.peliculasAPIFiltradas = [];
        this.errorAPI = 'Error al buscar en la API. Intenta de nuevo.';
      }
    });
  }

  toggleAPI() {
    this.usarAPI = !this.usarAPI;
    if (this.usarAPI && this.peliculasAPI.length === 0) {
      this.cargarPeliculasPopularesAPI();
    }
    this.filtrarPeliculas();
  }

  getNombreAPI(pelicula: PeliculaTransformada): string {
    return pelicula.nombre;
  }

  getImagenAPI(pelicula: PeliculaTransformada): string {
    return pelicula.imagen || 'assets/logoStreamZone.png';
  }

  toggleFavoritoAPI(pelicula: PeliculaTransformada) {
    const userId = this.user?.id;
    if (!userId) {
      return;
    }

    if (this.favoritosAPI.has(pelicula.id)) {
      const favoriteId = this.favoriteIdByTmdb.get(pelicula.id);
      if (favoriteId) {
        this.favoritesApi.delete(favoriteId).subscribe({
          next: () => {
            this.favoritosAPI.delete(pelicula.id);
            this.favoriteIdByTmdb.delete(pelicula.id);
          },
          error: (error) => {
            console.warn('Error al eliminar favorito en API. Fallback localStorage.', error);
            this.toggleFavoritoAPILocal(pelicula);
          },
        });
        return;
      }
    }

    this.favoritesApi.add(toAddMovieListPayload(userId, pelicula)).subscribe({
      next: (response) => {
        this.favoritosAPI.add(pelicula.id);
        if (response.favorite?.id) {
          this.favoriteIdByTmdb.set(pelicula.id, response.favorite.id);
        }
      },
      error: (error) => {
        console.warn('Error al guardar favorito en API. Fallback localStorage.', error);
        this.toggleFavoritoAPILocal(pelicula);
      },
    });
  }

  esFavoritoAPI(pelicula: PeliculaTransformada): boolean {
    return this.favoritosAPI.has(pelicula.id);
  }

  toggleVerMasTardeAPI(pelicula: PeliculaTransformada) {
    const userId = this.user?.id;
    if (!userId) {
      return;
    }

    if (this.verMasTardeAPI.has(pelicula.id)) {
      const watchLaterId = this.watchLaterIdByTmdb.get(pelicula.id);
      if (watchLaterId) {
        this.watchLaterApi.delete(watchLaterId).subscribe({
          next: () => {
            this.verMasTardeAPI.delete(pelicula.id);
            this.watchLaterIdByTmdb.delete(pelicula.id);
          },
          error: (error) => {
            console.warn('Error al eliminar ver más tarde en API. Fallback localStorage.', error);
            this.toggleVerMasTardeAPILocal(pelicula);
          },
        });
        return;
      }
    }

    this.watchLaterApi.add(toAddMovieListPayload(userId, pelicula)).subscribe({
      next: (response) => {
        this.verMasTardeAPI.add(pelicula.id);
        if (response.watch_later?.id) {
          this.watchLaterIdByTmdb.set(pelicula.id, response.watch_later.id);
        }
      },
      error: (error) => {
        console.warn('Error al guardar ver más tarde en API. Fallback localStorage.', error);
        this.toggleVerMasTardeAPILocal(pelicula);
      },
    });
  }

  estaEnVerMasTardeAPI(pelicula: PeliculaTransformada): boolean {
    return this.verMasTardeAPI.has(pelicula.id);
  }

  /** Fallback temporal si el backend no está disponible */
  private toggleFavoritoAPILocal(pelicula: PeliculaTransformada) {
    if (this.favoritosAPI.has(pelicula.id)) {
      this.favoritosAPI.delete(pelicula.id);
    } else {
      this.favoritosAPI.add(pelicula.id);
    }
    this.guardarSetEnStorage(this.API_FAVORITOS_KEY, this.favoritosAPI);
    this.sincronizarDetalleApiGuardado(
      this.API_FAVORITOS_DATA_KEY,
      this.favoritosAPI,
      pelicula
    );
  }

  /** Fallback temporal si el backend no está disponible */
  private toggleVerMasTardeAPILocal(pelicula: PeliculaTransformada) {
    if (this.verMasTardeAPI.has(pelicula.id)) {
      this.verMasTardeAPI.delete(pelicula.id);
    } else {
      this.verMasTardeAPI.add(pelicula.id);
    }
    this.guardarSetEnStorage(this.API_VER_MAS_TARDE_KEY, this.verMasTardeAPI);
    this.sincronizarDetalleApiGuardado(
      this.API_VER_MAS_TARDE_DATA_KEY,
      this.verMasTardeAPI,
      pelicula
    );
  }

  private sincronizarDetalleApiGuardado(
    key: string,
    ids: Set<number>,
    pelicula: PeliculaTransformada
  ) {
    const detalleActual = this.obtenerDetallesApiDesdeStorage(key);
    const sinActual = detalleActual.filter((item) => item.id !== pelicula.id);

    if (ids.has(pelicula.id)) {
      sinActual.unshift({
        id: pelicula.id,
        nombre: pelicula.nombre,
        imagen: pelicula.imagen
      });
    }

    localStorage.setItem(key, JSON.stringify(sinActual));
  }

  private obtenerDetallesApiDesdeStorage(key: string): PeliculaGuardadaApi[] {
    const stored = localStorage.getItem(key);
    if (!stored) {
      return [];
    }

    try {
      const parsed = JSON.parse(stored) as PeliculaGuardadaApi[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
}
