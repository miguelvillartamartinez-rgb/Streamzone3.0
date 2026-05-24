import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth';
import { TruncatePipe, CapitalizePipe } from '../pipes';
import { PeliculasApiService, PeliculaTransformada } from '../services/peliculas-api.service';

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
  private readonly API_FAVORITOS_KEY = 'apiFavoritos';
  private readonly API_VER_MAS_TARDE_KEY = 'apiVerMasTarde';
  private readonly API_FAVORITOS_DATA_KEY = 'apiFavoritosData';
  private readonly API_VER_MAS_TARDE_DATA_KEY = 'apiVerMasTardeData';

  user: any = null;
  terminoBusqueda: string = '';
  imagenesSt: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  imagenesTransformers: number[] = [1, 2, 3, 4, 5, 6, 7];
  imagenesStFiltradas: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  imagenesTransformersFiltradas: number[] = [1, 2, 3, 4, 5, 6, 7];
  
  // Películas de la API
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private peliculasApi: PeliculasApiService
  ) {}

  ngOnInit() {
    this.user = this.authService.getUser();
    this.cargarFavoritos();
    this.cargarVerMasTarde();
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

  cargarFavoritos() {
    this.favoritosStarWars = this.obtenerSetDesdeStorage('starWarsFavoritos');
    this.favoritosTransformers = this.obtenerSetDesdeStorage('transformersFavoritos');
    this.favoritosAPI = this.obtenerSetDesdeStorage(this.API_FAVORITOS_KEY);
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

  cargarVerMasTarde() {
    this.verMasTardeStarWars = this.obtenerSetDesdeStorage('starWarsVerMasTarde');
    this.verMasTardeTransformers = this.obtenerSetDesdeStorage('transformersVerMasTarde');
    this.verMasTardeAPI = this.obtenerSetDesdeStorage(this.API_VER_MAS_TARDE_KEY);
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

  esFavoritoAPI(pelicula: PeliculaTransformada): boolean {
    return this.favoritosAPI.has(pelicula.id);
  }

  toggleVerMasTardeAPI(pelicula: PeliculaTransformada) {
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

  estaEnVerMasTardeAPI(pelicula: PeliculaTransformada): boolean {
    return this.verMasTardeAPI.has(pelicula.id);
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
