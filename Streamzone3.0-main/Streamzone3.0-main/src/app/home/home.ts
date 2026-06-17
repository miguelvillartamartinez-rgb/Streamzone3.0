import { afterNextRender, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { TruncatePipe, CapitalizePipe } from '../pipes';
import { PeliculasApiService, PeliculaTransformada } from '../services/peliculas-api.service';
import { FavoritesApiService } from '../services/favorites-api.service';
import { WatchLaterApiService } from '../services/watch-later-api.service';
import { toAddMovieListPayload, toAddMovieByIdPayload, buildPosterUrl } from '../services/api-movie.helper';
import { SessionUser, ApiMovie } from '../models/backend-api.models';
import { MoviesApiService } from '../services/movies-api.service';
import { isAdminUser } from '../utils/admin-user';

type CatalogoHomeItem =
  | { tipo: 'starwars'; localNum: number }
  | { tipo: 'transformers'; localNum: number }
  | { tipo: 'admin'; pelicula: ApiMovie };

/**
 * Pantalla principal: agrega tres fuentes de catálogo en una sola vista.
 *   - Locales: assets Star Wars / Transformers (sin BD)
 *   - TMDB: API externa vía PeliculasApiService
 *   - Manuales: GET /api/movies filtrado por source='manual'
 * Gestión de catálogo (alta/borrado) restringida al admin vía isAdminUser().
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule, TruncatePipe, CapitalizePipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css', '../app.css']
})
export class Home implements OnInit {
  user: SessionUser | null = null;
  terminoBusqueda: string = '';
  imagenesSt: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  imagenesTransformers: number[] = [1, 2, 3, 4, 5, 6, 7];
  imagenesStFiltradas: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  imagenesTransformersFiltradas: number[] = [1, 2, 3, 4, 5, 6, 7];
  
  peliculasAPI: PeliculaTransformada[] = [];
  peliculasAPIFiltradas: PeliculaTransformada[] = [];
  peliculasManuales: ApiMovie[] = [];
  peliculasManualesFiltradas: ApiMovie[] = [];
  cargandoManuales = false;
  errorManuales = '';
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
  favoritosManuales: Set<number> = new Set();
  verMasTardeStarWars: Set<number> = new Set();
  verMasTardeTransformers: Set<number> = new Set();
  verMasTardeAPI: Set<number> = new Set();
  verMasTardeManuales: Set<number> = new Set();

  /** Mapa tmdb_id -> id de fila en favorites (PostgreSQL) */
  private favoriteIdByTmdb = new Map<number, number>();
  /** Mapa movie_id -> id de fila en favorites (películas manuales) */
  private favoriteIdByMovieId = new Map<number, number>();
  /** Mapa tmdb_id -> id de fila en watch_later (PostgreSQL) */
  private watchLaterIdByTmdb = new Map<number, number>();
  /** Mapa movie_id -> id de fila en watch_later (películas manuales) */
  private watchLaterIdByMovieId = new Map<number, number>();

  constructor(
    private authService: AuthService,
    private router: Router,
    private peliculasApi: PeliculasApiService,
    private favoritesApi: FavoritesApiService,
    private watchLaterApi: WatchLaterApiService,
    private moviesApi: MoviesApiService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.user = this.authService.getUser();
      this.cargarFavoritosApiDesdeBackend();
      this.cargarVerMasTardeApiDesdeBackend();
    });
  }

  ngOnInit() {
    this.user = this.authService.getUser();
    this.cargarFavoritosLocales();
    this.cargarVerMasTardeLocales();
    this.filtrarPeliculas();
    this.cargarPeliculasPopularesAPI();
    this.cargarPeliculasManuales();
  }

  /** GET /api/movies → filtra source='manual' para la sección PostgreSQL del Home. */
  cargarPeliculasManuales() {
    this.cargandoManuales = true;
    this.errorManuales = '';

    this.moviesApi.getAll().subscribe({
      next: (response) => {
        this.peliculasManuales = (response.movies ?? []).filter((movie) => movie.source === 'manual');
        this.filtrarPeliculasManuales();
        this.cargandoManuales = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al cargar películas manuales:', error);
        this.peliculasManuales = [];
        this.peliculasManualesFiltradas = [];
        this.errorManuales = 'No se pudo cargar parte del catálogo.';
        this.cargandoManuales = false;
        this.cdr.detectChanges();
      },
    });
  }

  filtrarPeliculasManuales() {
    if (!this.terminoBusqueda.trim()) {
      this.peliculasManualesFiltradas = [...this.peliculasManuales];
      return;
    }

    const termino = this.normalizarTexto(this.terminoBusqueda);
    this.peliculasManualesFiltradas = this.peliculasManuales.filter((movie) =>
      this.normalizarTexto(movie.title).includes(termino)
    );
  }

  filtrarPeliculas() {
    if (!this.terminoBusqueda.trim()) {
      this.imagenesStFiltradas = [...this.imagenesSt];
      this.imagenesTransformersFiltradas = [...this.imagenesTransformers];
      this.filtrarPeliculasManuales();
      if (this.usarAPI) {
        this.peliculasAPIFiltradas = [...this.peliculasAPI];
      }
      return;
    }

    this.filtrarPeliculasManuales();

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
    const user = this.authService.getUser();
    const userId = this.authService.getUserId();
    console.log('Usuario actual:', user);

    if (!userId) {
      this.favoritosAPI = new Set();
      this.favoritosManuales = new Set();
      this.favoriteIdByTmdb.clear();
      this.favoriteIdByMovieId.clear();
      return;
    }

    this.favoritesApi.getByUserId(userId).subscribe({
      next: (response) => {
        this.favoritosAPI = new Set();
        this.favoritosManuales = new Set();
        this.favoriteIdByTmdb.clear();
        this.favoriteIdByMovieId.clear();
        (response.favorites ?? []).forEach((fav) => {
          const movie = fav.movie;
          if (!movie) {
            return;
          }
          if (movie.tmdb_id) {
            this.favoritosAPI.add(movie.tmdb_id);
            this.favoriteIdByTmdb.set(movie.tmdb_id, fav.id);
          } else if (movie.id) {
            this.favoritosManuales.add(movie.id);
            this.favoriteIdByMovieId.set(movie.id, fav.id);
          }
        });
        console.log('Favoritos cargados en home:', Array.from(this.favoritosAPI));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al cargar favoritos en home:', error);
        this.cdr.detectChanges();
      },
    });
  }

  cargarVerMasTardeApiDesdeBackend() {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.verMasTardeAPI = new Set();
      this.verMasTardeManuales = new Set();
      this.watchLaterIdByTmdb.clear();
      this.watchLaterIdByMovieId.clear();
      return;
    }

    this.watchLaterApi.getByUserId(userId).subscribe({
      next: (response) => {
        this.verMasTardeAPI = new Set();
        this.verMasTardeManuales = new Set();
        this.watchLaterIdByTmdb.clear();
        this.watchLaterIdByMovieId.clear();
        (response.watch_later ?? []).forEach((item) => {
          const movie = item.movie;
          if (!movie) {
            return;
          }
          if (movie.tmdb_id) {
            this.verMasTardeAPI.add(movie.tmdb_id);
            this.watchLaterIdByTmdb.set(movie.tmdb_id, item.id);
          } else if (movie.id) {
            this.verMasTardeManuales.add(movie.id);
            this.watchLaterIdByMovieId.set(movie.id, item.id);
          }
        });
        console.log('Ver más tarde cargados en home:', Array.from(this.verMasTardeAPI));
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al cargar ver más tarde en home:', error);
        this.cdr.detectChanges();
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

  onManualPosterError(event: Event, pelicula: ApiMovie) {
    const img = event.target as HTMLImageElement;
    const expected = buildPosterUrl(pelicula.poster_path);

    if (expected === 'assets/logoStreamZone.png') {
      img.src = expected;
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /** Precarga catálogo TMDB (The Movie Database) para la sección API del Home. */
  cargarPeliculasPopularesAPI() {
    this.errorAPI = '';
    this.cargandoAPI = true;
    this.peliculasApi.obtenerPeliculasPopulares(1, 'es-ES').subscribe({
      next: (peliculas) => {
        this.peliculasAPI = [...peliculas];
        this.peliculasAPIFiltradas = [...peliculas];
        if (peliculas.length === 0) {
          this.errorAPI = 'No se pudieron cargar películas de la API en este momento.';
        }
        this.cargandoAPI = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al cargar películas de la API:', error);
        this.cargandoAPI = false;
        this.errorAPI = 'No se pudo conectar con la API externa. Mostrando catálogo local.';
        this.usarAPI = false;
        this.cdr.detectChanges();
      },
    });
  }

  buscarEnAPI(termino: string) {
    if (!termino.trim() || termino.length < 2) {
      this.peliculasAPIFiltradas = [...this.peliculasAPI];
      return;
    }
    this.errorAPI = '';
    this.cargandoAPI = true;
    this.cdr.detectChanges();
    this.peliculasApi.buscarPeliculas(termino, 1, 'es-ES').subscribe({
      next: (peliculas) => {
        this.peliculasAPIFiltradas = [...peliculas];
        this.cargandoAPI = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al buscar en la API:', error);
        this.cargandoAPI = false;
        this.peliculasAPIFiltradas = [];
        this.errorAPI = 'Error al buscar en la API. Intenta de nuevo.';
        this.cdr.detectChanges();
      },
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

  getPosterManual(pelicula: ApiMovie): string {
    return buildPosterUrl(pelicula.poster_path);
  }

  /** Lista unificada solo para pintar el catálogo propio en Home (SW + Transformers + admin). */
  get catalogoStreamZoneFiltrado(): CatalogoHomeItem[] {
    const items: CatalogoHomeItem[] = [];

    for (const num of this.imagenesStFiltradas) {
      items.push({ tipo: 'starwars', localNum: num });
    }
    for (const num of this.imagenesTransformersFiltradas) {
      items.push({ tipo: 'transformers', localNum: num });
    }
    for (const pelicula of this.peliculasManualesFiltradas) {
      items.push({ tipo: 'admin', pelicula });
    }

    return items;
  }

  getCatalogoTitulo(item: CatalogoHomeItem): string {
    if (item.tipo === 'starwars') {
      return this.getNombreStarWars(item.localNum);
    }
    if (item.tipo === 'transformers') {
      return this.getNombreTransformers(item.localNum);
    }
    return item.pelicula.title;
  }

  getCatalogoImagen(item: CatalogoHomeItem): string {
    if (item.tipo === 'starwars') {
      return this.getImagenStPath(item.localNum);
    }
    if (item.tipo === 'transformers') {
      return this.getImagenTransformersPath(item.localNum);
    }
    return this.getPosterManual(item.pelicula);
  }

  esFavoritoCatalogo(item: CatalogoHomeItem): boolean {
    if (item.tipo === 'starwars') {
      return this.esFavoritoStarWars(item.localNum);
    }
    if (item.tipo === 'transformers') {
      return this.esFavoritoTransformers(item.localNum);
    }
    return this.favoritosManuales.has(item.pelicula.id);
  }

  estaEnVerMasTardeCatalogo(item: CatalogoHomeItem): boolean {
    if (item.tipo === 'starwars') {
      return this.estaEnVerMasTardeStarWars(item.localNum);
    }
    if (item.tipo === 'transformers') {
      return this.estaEnVerMasTardeTransformers(item.localNum);
    }
    return this.verMasTardeManuales.has(item.pelicula.id);
  }

  toggleFavoritoCatalogo(item: CatalogoHomeItem) {
    if (item.tipo === 'starwars') {
      this.toggleFavoritoStarWars(item.localNum);
      return;
    }
    if (item.tipo === 'transformers') {
      this.toggleFavoritoTransformers(item.localNum);
      return;
    }
    this.toggleFavoritoManual(item.pelicula);
  }

  toggleVerMasTardeCatalogo(item: CatalogoHomeItem) {
    if (item.tipo === 'starwars') {
      this.toggleVerMasTardeStarWars(item.localNum);
      return;
    }
    if (item.tipo === 'transformers') {
      this.toggleVerMasTardeTransformers(item.localNum);
      return;
    }
    this.toggleVerMasTardeManual(item.pelicula);
  }

  reproducirCatalogoItem(item: CatalogoHomeItem) {
    if (item.tipo === 'starwars') {
      this.reproducirStarWars(item.localNum);
      return;
    }
    if (item.tipo === 'transformers') {
      this.reproducirTransformers(item.localNum);
      return;
    }
    this.reproducirPeliculaManual(item.pelicula);
  }

  onCatalogoPosterError(event: Event, item: CatalogoHomeItem) {
    if (item.tipo === 'admin') {
      this.onManualPosterError(event, item.pelicula);
    }
  }

  /** Controla visibilidad de «Añadir película» y botón eliminar (solo admin@gmail.com). */
  get esAdmin(): boolean {
    return isAdminUser(this.user);
  }

  /** DELETE /api/movies/:id con confirmación; actualiza lista local sin recargar. */
  eliminarPeliculaManual(pelicula: ApiMovie) {
    if (!this.esAdmin) {
      return;
    }

    const confirmacion = confirm(
      `¿Eliminar "${pelicula.title}"? Esta acción no se puede deshacer.`
    );

    if (!confirmacion) {
      return;
    }

    this.moviesApi.deleteManualMovie(pelicula.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.peliculasManuales = this.peliculasManuales.filter((movie) => movie.id !== pelicula.id);
          this.favoritosManuales.delete(pelicula.id);
          this.verMasTardeManuales.delete(pelicula.id);
          this.favoriteIdByMovieId.delete(pelicula.id);
          this.watchLaterIdByMovieId.delete(pelicula.id);
          this.filtrarPeliculasManuales();
          this.cdr.detectChanges();
          return;
        }

        console.error('[StreamZone] No se pudo eliminar la película manual:', response.message);
        alert(response.message || 'No se pudo eliminar la película');
      },
      error: (error) => {
        console.error('[StreamZone] Error al eliminar película manual:', error);
        alert(error?.error?.message || 'Error al eliminar la película');
      },
    });
  }

  reproducirPeliculaManual(pelicula: ApiMovie) {
    this.router.navigate(['/reproducir'], {
      queryParams: { origen: 'db', id: pelicula.id },
    });
  }

  reproducirPeliculaTmdb(pelicula: PeliculaTransformada) {
    this.router.navigate(['/reproducir'], {
      queryParams: { origen: 'tmdb', tmdbId: pelicula.id },
    });
  }

  reproducirStarWars(num: number) {
    this.router.navigate(['/reproducir'], {
      queryParams: {
        origen: 'local',
        saga: 'starwars',
        num,
        titulo: this.getNombreStarWars(num),
      },
    });
  }

  reproducirTransformers(num: number) {
    this.router.navigate(['/reproducir'], {
      queryParams: {
        origen: 'local',
        saga: 'transformers',
        num,
        titulo: this.getNombreTransformers(num),
      },
    });
  }

  toggleFavoritoManual(pelicula: ApiMovie) {
    const userId = this.obtenerUserIdOAlertar();
    if (!userId) {
      return;
    }

    if (this.favoritosManuales.has(pelicula.id)) {
      const favoriteId = this.favoriteIdByMovieId.get(pelicula.id);
      if (!favoriteId) {
        this.favoritosManuales.delete(pelicula.id);
        this.cargarFavoritosApiDesdeBackend();
        return;
      }

      this.favoritesApi.delete(favoriteId).subscribe({
        next: () => {
          this.favoritosManuales.delete(pelicula.id);
          this.favoriteIdByMovieId.delete(pelicula.id);
          this.cdr.detectChanges();
        },
        error: (error) => this.manejarErrorBackend('eliminar favorito', error),
      });
      return;
    }

    const payload = toAddMovieByIdPayload(userId, pelicula.id);
    this.favoritesApi.add(payload).subscribe({
      next: (response) => {
        if (response.favorite?.id && response.favorite.movie?.id) {
          this.favoritosManuales.add(response.favorite.movie.id);
          this.favoriteIdByMovieId.set(response.favorite.movie.id, response.favorite.id);
        } else if (response.message?.includes('ya existía')) {
          this.cargarFavoritosApiDesdeBackend();
        }
        this.cdr.detectChanges();
      },
      error: (error) => this.manejarErrorBackend('guardar favorito', error),
    });
  }

  toggleVerMasTardeManual(pelicula: ApiMovie) {
    const userId = this.obtenerUserIdOAlertar();
    if (!userId) {
      return;
    }

    if (this.verMasTardeManuales.has(pelicula.id)) {
      const watchLaterId = this.watchLaterIdByMovieId.get(pelicula.id);
      if (!watchLaterId) {
        this.verMasTardeManuales.delete(pelicula.id);
        this.cargarVerMasTardeApiDesdeBackend();
        return;
      }

      this.watchLaterApi.delete(watchLaterId).subscribe({
        next: () => {
          this.verMasTardeManuales.delete(pelicula.id);
          this.watchLaterIdByMovieId.delete(pelicula.id);
          this.cdr.detectChanges();
        },
        error: (error) => this.manejarErrorBackend('eliminar de ver más tarde', error),
      });
      return;
    }

    const payload = toAddMovieByIdPayload(userId, pelicula.id);
    this.watchLaterApi.add(payload).subscribe({
      next: (response) => {
        if (response.watch_later?.id && response.watch_later.movie?.id) {
          this.verMasTardeManuales.add(response.watch_later.movie.id);
          this.watchLaterIdByMovieId.set(response.watch_later.movie.id, response.watch_later.id);
        } else if (response.message?.includes('ya estaba')) {
          this.cargarVerMasTardeApiDesdeBackend();
        }
        this.cdr.detectChanges();
      },
      error: (error) => this.manejarErrorBackend('guardar en ver más tarde', error),
    });
  }

  toggleFavoritoAPI(pelicula: PeliculaTransformada) {
    const user = this.authService.getUser();
    const userId = this.obtenerUserIdOAlertar();
    if (!userId) {
      return;
    }

    if (this.favoritosAPI.has(pelicula.id)) {
      const favoriteId = this.favoriteIdByTmdb.get(pelicula.id);
      if (!favoriteId) {
        this.favoritosAPI.delete(pelicula.id);
        this.cargarFavoritosApiDesdeBackend();
        return;
      }

      this.favoritesApi.delete(favoriteId).subscribe({
        next: () => {
          this.favoritosAPI.delete(pelicula.id);
          this.favoriteIdByTmdb.delete(pelicula.id);
          this.cdr.detectChanges();
        },
        error: (error) => this.manejarErrorBackend('eliminar favorito', error),
      });
      return;
    }

    const payload = toAddMovieListPayload(userId, pelicula);
    console.log('Usuario actual:', user);
    console.log('Payload favorito:', payload);

    this.favoritesApi.add(payload).subscribe({
      next: (response) => {
        console.log('Respuesta favorito:', response);
        if (response.favorite?.id && response.favorite.movie?.tmdb_id) {
          this.favoritosAPI.add(response.favorite.movie.tmdb_id);
          this.favoriteIdByTmdb.set(response.favorite.movie.tmdb_id, response.favorite.id);
        }
        this.cdr.detectChanges();
      },
      error: (error) => this.manejarErrorBackend('guardar favorito', error),
    });
  }

  esFavoritoAPI(pelicula: PeliculaTransformada): boolean {
    return this.favoritosAPI.has(pelicula.id);
  }

  toggleVerMasTardeAPI(pelicula: PeliculaTransformada) {
    const user = this.authService.getUser();
    const userId = this.obtenerUserIdOAlertar();
    if (!userId) {
      return;
    }

    if (this.verMasTardeAPI.has(pelicula.id)) {
      const watchLaterId = this.watchLaterIdByTmdb.get(pelicula.id);
      if (!watchLaterId) {
        this.verMasTardeAPI.delete(pelicula.id);
        this.cargarVerMasTardeApiDesdeBackend();
        return;
      }

      this.watchLaterApi.delete(watchLaterId).subscribe({
        next: () => {
          this.verMasTardeAPI.delete(pelicula.id);
          this.watchLaterIdByTmdb.delete(pelicula.id);
          this.cdr.detectChanges();
        },
        error: (error) => this.manejarErrorBackend('eliminar de ver más tarde', error),
      });
      return;
    }

    const payload = toAddMovieListPayload(userId, pelicula);
    console.log('Usuario actual:', user);
    console.log('Payload ver más tarde:', payload);

    this.watchLaterApi.add(payload).subscribe({
      next: (response) => {
        console.log('Respuesta ver más tarde:', response);
        if (response.watch_later?.id && response.watch_later.movie?.tmdb_id) {
          this.verMasTardeAPI.add(response.watch_later.movie.tmdb_id);
          this.watchLaterIdByTmdb.set(response.watch_later.movie.tmdb_id, response.watch_later.id);
        }
        this.cdr.detectChanges();
      },
      error: (error) => this.manejarErrorBackend('guardar en ver más tarde', error),
    });
  }

  estaEnVerMasTardeAPI(pelicula: PeliculaTransformada): boolean {
    return this.verMasTardeAPI.has(pelicula.id);
  }

  /** Lee user_id actualizado desde localStorage tras el login */
  private obtenerUserIdOAlertar(): number | null {
    this.user = this.authService.getUser();
    const userId = this.authService.getUserId();

    if (!userId) {
      const mensaje = 'Debes iniciar sesión para guardar en tu cuenta.';
      this.errorAPI = mensaje;
      console.error('[StreamZone]', mensaje);
      alert(mensaje);
      this.cdr.detectChanges();
      return null;
    }

    return userId;
  }

  private manejarErrorBackend(accion: string, error: unknown): void {
    const httpError = error as { status?: number; error?: { message?: string } };
    const mensajeBackend = httpError?.error?.message;
    const mensaje =
      mensajeBackend ||
      `No se pudo ${accion}. Error ${httpError?.status ?? 'de red'}.`;

    console.error(`[StreamZone] Error al ${accion}:`, error);
    this.errorAPI = mensaje;
    alert(mensaje);
    this.cdr.detectChanges();
  }
}
