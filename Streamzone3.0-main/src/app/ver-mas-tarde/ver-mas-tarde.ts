import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CapitalizePipe } from '../pipes';

interface PeliculaVerMasTarde {
  id: number;
  nombre: string;
  imagen: string;
  origen: 'local' | 'api';
}

@Component({
  selector: 'app-ver-mas-tarde',
  standalone: true,
  imports: [CommonModule, CapitalizePipe],
  templateUrl: './ver-mas-tarde.html',
  styleUrls: ['./ver-mas-tarde.css']
})
export class VerMasTarde implements OnInit {
  private readonly API_VER_MAS_TARDE_DATA_KEY = 'apiVerMasTardeData';

  peliculasStarWars: PeliculaVerMasTarde[] = [];
  peliculasTransformers: PeliculaVerMasTarde[] = [];
  peliculasApi: PeliculaVerMasTarde[] = [];

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
    this.cargarVerMasTardeStarWars();
    this.cargarVerMasTardeTransformers();
    this.cargarVerMasTardeApi();
  }

  cargarVerMasTardeStarWars() {
    this.peliculasStarWars = [];
    const verMasTardeStr = localStorage.getItem('starWarsVerMasTarde');
    if (verMasTardeStr) {
      const verMasTardeArray = JSON.parse(verMasTardeStr) as number[];
      this.peliculasStarWars = verMasTardeArray.map(id => ({
        id: id,
        nombre: this.nombresStarWars[id - 1] || `Star Wars ${id}`,
        imagen: `assets/StarWars${id}.png`,
        origen: 'local'
      }));
    }
  }

  cargarVerMasTardeTransformers() {
    this.peliculasTransformers = [];
    const verMasTardeStr = localStorage.getItem('transformersVerMasTarde');
    if (verMasTardeStr) {
      const verMasTardeArray = JSON.parse(verMasTardeStr) as number[];
      this.peliculasTransformers = verMasTardeArray.map(id => ({
        id: id,
        nombre: this.nombresTransformers[id - 1] || `Transformers ${id}`,
        imagen: `assets/Transformers${id}.png`,
        origen: 'local'
      }));
    }
  }

  cargarVerMasTardeApi() {
    const verMasTardeApi = this.obtenerArrayDesdeStorage<PeliculaVerMasTarde>(this.API_VER_MAS_TARDE_DATA_KEY);
    this.peliculasApi = verMasTardeApi.map((pelicula) => ({
      ...pelicula,
      origen: 'api'
    }));
  }

  eliminarVerMasTarde(id: number) {
    const verMasTardeStr = localStorage.getItem('starWarsVerMasTarde');
    if (verMasTardeStr) {
      const verMasTardeArray = JSON.parse(verMasTardeStr) as number[];
      const nuevosVerMasTarde = verMasTardeArray.filter(favId => favId !== id);
      localStorage.setItem('starWarsVerMasTarde', JSON.stringify(nuevosVerMasTarde));
      this.cargarVerMasTardeStarWars();
    }
  }

  eliminarVerMasTardeTransformers(id: number) {
    const verMasTardeStr = localStorage.getItem('transformersVerMasTarde');
    if (verMasTardeStr) {
      const verMasTardeArray = JSON.parse(verMasTardeStr) as number[];
      const nuevosVerMasTarde = verMasTardeArray.filter(favId => favId !== id);
      localStorage.setItem('transformersVerMasTarde', JSON.stringify(nuevosVerMasTarde));
      this.cargarVerMasTardeTransformers();
    }
  }

  eliminarVerMasTardeApi(id: number) {
    const verMasTardeIds = this.obtenerArrayDesdeStorage<number>('apiVerMasTarde');
    const nuevosIds = verMasTardeIds.filter((favId) => favId !== id);
    localStorage.setItem('apiVerMasTarde', JSON.stringify(nuevosIds));

    const detalle = this.obtenerArrayDesdeStorage<PeliculaVerMasTarde>(this.API_VER_MAS_TARDE_DATA_KEY);
    const nuevoDetalle = detalle.filter((pelicula) => pelicula.id !== id);
    localStorage.setItem(this.API_VER_MAS_TARDE_DATA_KEY, JSON.stringify(nuevoDetalle));

    this.cargarVerMasTardeApi();
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

