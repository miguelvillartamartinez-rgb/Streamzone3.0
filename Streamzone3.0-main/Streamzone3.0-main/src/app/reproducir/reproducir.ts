import { afterNextRender, ChangeDetectorRef, Component, ElementRef, Injector, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { MoviesApiService } from '../services/movies-api.service';
import { PeliculasApiService } from '../services/peliculas-api.service';
import { ApiMovie } from '../models/backend-api.models';
import { buildPosterUrl } from '../services/api-movie.helper';
import {
  DEMO_VIDEO_URL,
  getLocalMovieTitle,
  getLocalPlaybackUrl,
  LocalSaga,
} from '../config/local-playback.config';
import {
  buildYoutubeEmbedUrl,
  PlaybackMode,
  resolveVideoPlayback,
} from '../utils/video-playback.helper';

@Component({
  selector: 'app-reproducir',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reproducir.html',
  styleUrl: './reproducir.css',
})
export class Reproducir implements OnInit {
  loading = true;
  errorMessage = '';
  infoMessage = '';
  videoErrorMessage = '';

  title = 'Reproducción';
  overview = '';
  posterUrl = 'assets/logoStreamZone.png';
  genre = '';
  durationMinutes: number | null = null;
  releaseDate: string | null = null;

  playbackMode: PlaybackMode = 'video';
  playbackSrc = DEMO_VIDEO_URL;
  safeIframeSrc: SafeResourceUrl | null = null;
  trailerTitle = '';

  @ViewChild('videoPlayer') private videoPlayer?: ElementRef<HTMLVideoElement>;

  private injector = inject(Injector);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private moviesApi: MoviesApiService,
    private peliculasApi: PeliculasApiService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const origen = params.get('origen');

      if (origen === 'db') {
        this.cargarPeliculaDb(params.get('id'));
        return;
      }

      if (origen === 'tmdb') {
        this.cargarPeliculaTmdb(params.get('tmdbId'));
        return;
      }

      if (origen === 'local') {
        this.cargarPeliculaLocal(params.get('saga'), params.get('num'), params.get('titulo'));
        return;
      }

      this.loading = false;
      this.errorMessage = 'Parámetros de reproducción no válidos.';
      this.cdr.detectChanges();
    });
  }

  volverAHome() {
    this.router.navigate(['/home']);
  }

  private cargarPeliculaDb(idParam: string | null) {
    const id = Number(idParam);

    if (!Number.isInteger(id) || id <= 0) {
      this.loading = false;
      this.errorMessage = 'Identificador de película no válido.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.moviesApi.getById(id).subscribe({
      next: (response) => {
        if (!response.success || !response.movie) {
          this.loading = false;
          this.errorMessage = response.message || 'No se encontró la película.';
          this.cdr.detectChanges();
          return;
        }

        this.aplicarDatosPelicula(response.movie);
        const playback = resolveVideoPlayback(response.movie.video_url);
        this.aplicarReproduccionManual(playback, response.movie.video_url);
        this.loading = false;
        this.cdr.detectChanges();
        this.syncVideoElement();
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage =
          error?.error?.message || 'No se pudo cargar la película desde el servidor.';
        this.cdr.detectChanges();
      },
    });
  }

  private cargarPeliculaTmdb(tmdbIdParam: string | null) {
    const tmdbId = Number(tmdbIdParam);

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      this.loading = false;
      this.errorMessage = 'Identificador TMDB no válido.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.peliculasApi.obtenerDetallePelicula(tmdbId).subscribe({
      next: (detalle) => {
        if (!detalle) {
          this.loading = false;
          this.errorMessage = 'No se pudo obtener la información de la película TMDB.';
          this.cdr.detectChanges();
          return;
        }

        this.title = detalle.nombre;
        this.overview = detalle.descripcion;
        this.posterUrl = detalle.imagen;
        this.releaseDate = detalle.release_date;
        this.genre = '';
        this.durationMinutes = null;

        this.peliculasApi.obtenerVideosPelicula(tmdbId).subscribe({
          next: (videos) => {
            if (videos.youtubeKey) {
              this.playbackMode = 'iframe';
              this.playbackSrc = buildYoutubeEmbedUrl(videos.youtubeKey);
              this.safeIframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.playbackSrc);
              this.trailerTitle = videos.title;
              this.infoMessage = 'Reproduciendo tráiler oficial desde TMDB.';
            } else {
              this.playbackMode = 'video';
              this.playbackSrc = DEMO_VIDEO_URL;
              this.infoMessage =
                'No se encontró tráiler en TMDB. Se muestra un vídeo demo para la demostración.';
            }

            this.loading = false;
            this.cdr.detectChanges();
          },
          error: () => {
            this.playbackMode = 'video';
            this.playbackSrc = DEMO_VIDEO_URL;
            this.infoMessage =
              'No se pudo consultar vídeos TMDB. Se muestra un vídeo demo para la demostración.';
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Error al consultar TMDB.';
        this.cdr.detectChanges();
      },
    });
  }

  private cargarPeliculaLocal(
    sagaParam: string | null,
    numParam: string | null,
    titleParam: string | null
  ) {
    const saga = sagaParam === 'transformers' ? 'transformers' : 'starwars';
    const num = Number(numParam);

    if (!Number.isInteger(num) || num <= 0) {
      this.loading = false;
      this.errorMessage = 'Identificador de película local no válido.';
      this.cdr.detectChanges();
      return;
    }

    this.title = getLocalMovieTitle(saga as LocalSaga, num, titleParam ?? undefined);
    this.overview = 'Reproducción demo del catálogo local de StreamZone.';
    this.posterUrl =
      saga === 'starwars' ? `assets/StarWars${num}.png` : `assets/Transformers${num}.png`;
    this.genre = saga === 'starwars' ? 'Ciencia ficción' : 'Acción';
    this.durationMinutes = null;
    this.releaseDate = null;

    const playback = resolveVideoPlayback(getLocalPlaybackUrl(saga as LocalSaga, num));
    this.aplicarReproduccion(
      playback.mode,
      playback.src,
      playback.isFallback,
      'local'
    );

    this.infoMessage = 'Reproducción demo del catálogo local (Star Wars / Transformers).';
    this.loading = false;
    this.cdr.detectChanges();
  }

  private aplicarDatosPelicula(movie: ApiMovie) {
    this.title = movie.title;
    this.overview = movie.overview ?? '';
    this.posterUrl = buildPosterUrl(movie.poster_path);
    this.genre = movie.genre ?? '';
    this.durationMinutes = movie.duration_minutes ?? null;
    this.releaseDate = movie.release_date;
  }

  onVideoError(): void {
    this.videoErrorMessage =
      'No se pudo cargar el vídeo. Comprueba que video_url apunte a un MP4/WebM accesible (por ejemplo: https://www.w3schools.com/html/mov_bbb.mp4).';
    this.cdr.detectChanges();
  }

  private aplicarReproduccionManual(
    playback: ReturnType<typeof resolveVideoPlayback>,
    originalVideoUrl: string | null | undefined
  ) {
    this.playbackMode = playback.mode;
    this.playbackSrc = playback.src;
    this.safeIframeSrc = null;
    this.videoErrorMessage = '';

    if (!playback.isFallback) {
      this.infoMessage = '';
      return;
    }

    const trimmedOriginal = originalVideoUrl?.trim();
    if (!trimmedOriginal) {
      this.infoMessage = 'Esta película no tiene video_url. Se muestra un vídeo demo.';
      return;
    }

    if (/\.(jpg|jpeg|png|webp|gif|svg)(\?|#|$)/i.test(trimmedOriginal)) {
      this.infoMessage =
        'El video_url guardado parece ser una imagen, no un archivo de vídeo. Se muestra un vídeo demo.';
      return;
    }

    if (/commondatastorage\.googleapis\.com/i.test(trimmedOriginal)) {
      this.infoMessage =
        'La URL de Google Storage guardada no es accesible desde este entorno. Se usa un vídeo demo alternativo.';
      return;
    }

    this.infoMessage =
      'No se pudo usar el video_url guardado. Se muestra un vídeo demo accesible para la demostración.';
  }

  private syncVideoElement(): void {
    if (this.playbackMode !== 'video' || !this.playbackSrc) {
      return;
    }

    afterNextRender(
      () => {
        const video = this.videoPlayer?.nativeElement;
        if (!video) {
          return;
        }

        if (video.getAttribute('src') !== this.playbackSrc) {
          video.src = this.playbackSrc;
        }

        video.load();
      },
      { injector: this.injector }
    );
  }

  private aplicarReproduccion(
    mode: PlaybackMode,
    src: string,
    isFallback: boolean,
    origen: 'manual' | 'local'
  ) {
    this.playbackMode = mode;
    this.playbackSrc = src;
    this.safeIframeSrc =
      mode === 'iframe' ? this.sanitizer.bypassSecurityTrustResourceUrl(src) : null;

    if (isFallback) {
      this.infoMessage =
        origen === 'manual'
          ? 'Esta película no tiene video_url. Se muestra un vídeo demo.'
          : 'Se muestra un vídeo demo para la demostración.';
    }
  }
}
