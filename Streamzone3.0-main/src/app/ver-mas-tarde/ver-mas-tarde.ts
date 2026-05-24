import { afterNextRender, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CapitalizePipe } from '../pipes';
import { AuthService } from '../auth';
import { WatchLaterApiService } from '../services/watch-later-api.service';
import { mapWatchLaterToPelicula, PeliculaListaApi } from '../services/api-list.mapper';

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
  peliculasStarWars: PeliculaVerMasTarde[] = [];
  peliculasTransformers: PeliculaVerMasTarde[] = [];
  peliculasApi: PeliculaVerMasTarde[] = [];
  errorApi: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private watchLaterApi: WatchLaterApiService,
    private cdr: ChangeDetectorRef
  ) {
    afterNextRender(() => {
      this.cargarVerMasTardeApiDesdeBackend();
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
    this.cargarVerMasTardeStarWars();
    this.cargarVerMasTardeTransformers();
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

  cargarVerMasTardeApiDesdeBackend() {
    const user = this.authService.getUser();
    const userId = this.authService.getUserId();
    console.log('Usuario actual:', user);

    if (!userId) {
      this.peliculasApi = [];
      this.errorApi = 'Inicia sesión para ver tu lista de ver más tarde.';
      this.cdr.detectChanges();
      return;
    }

    this.watchLaterApi.getByUserId(userId).subscribe({
      next: (response) => {
        const watchLater = (response.watch_later ?? []).map(mapWatchLaterToPelicula);
        console.log('Ver más tarde cargados:', watchLater);

        this.peliculasApi = watchLater.map((w) => this.toPeliculaVerMasTarde(w));
        this.errorApi = '';
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('[StreamZone] Error al cargar ver más tarde:', error);
        this.peliculasApi = [];
        this.errorApi = 'No se pudo cargar la lista desde el servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  eliminarVerMasTarde(id: number) {
    const verMasTardeStr = localStorage.getItem('starWarsVerMasTarde');
    if (verMasTardeStr) {
      const verMasTardeArray = JSON.parse(verMasTardeStr) as number[];
      const nuevosVerMasTarde = verMasTardeArray.filter(favId => favId !== id);
      localStorage.setItem('starWarsVerMasTarde', JSON.stringify(nuevosVerMasTarde));
      this.cargarVerMasTardeStarWars();
      this.cdr.detectChanges();
    }
  }

  eliminarVerMasTardeTransformers(id: number) {
    const verMasTardeStr = localStorage.getItem('transformersVerMasTarde');
    if (verMasTardeStr) {
      const verMasTardeArray = JSON.parse(verMasTardeStr) as number[];
      const nuevosVerMasTarde = verMasTardeArray.filter(favId => favId !== id);
      localStorage.setItem('transformersVerMasTarde', JSON.stringify(nuevosVerMasTarde));
      this.cargarVerMasTardeTransformers();
      this.cdr.detectChanges();
    }
  }

  eliminarVerMasTardeApi(watchLaterId: number) {
    this.watchLaterApi.delete(watchLaterId).subscribe({
      next: () => this.cargarVerMasTardeApiDesdeBackend(),
      error: (error) => {
        console.error('[StreamZone] Error al eliminar ver más tarde:', error);
        alert('No se pudo eliminar de ver más tarde.');
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

  private toPeliculaVerMasTarde(item: PeliculaListaApi): PeliculaVerMasTarde {
    return {
      id: item.id,
      nombre: item.nombre,
      imagen: item.imagen,
      origen: 'api',
    };
  }
}
