import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MoviesApiService } from '../services/movies-api.service';
import { DEMO_VIDEO_URL } from '../config/local-playback.config';
import { AuthService } from '../auth';
import { isAdminUser } from '../utils/admin-user';

@Component({
  selector: 'app-alta-pelicula',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './alta-pelicula.html',
  styleUrl: './alta-pelicula.css',
})
export class AltaPelicula implements OnInit {
  title = '';
  overview = '';
  releaseDate = '';
  genre = '';
  durationMinutes: number | null = null;
  posterPath = '';
  videoUrl = DEMO_VIDEO_URL;

  loading = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private moviesApi: MoviesApiService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!isAdminUser(this.authService.getUser())) {
      this.router.navigate(['/home']);
    }
  }

  onSubmit() {
    if (!isAdminUser(this.authService.getUser())) {
      this.router.navigate(['/home']);
      return;
    }

    const trimmedTitle = this.title.trim();

    if (!trimmedTitle) {
      this.errorMessage = 'El título es obligatorio';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    if (this.durationMinutes !== null && this.durationMinutes <= 0) {
      this.errorMessage = 'La duración debe ser un número positivo';
      this.successMessage = '';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.detectChanges();

    this.moviesApi
      .createManual({
        title: trimmedTitle,
        overview: this.overview.trim() || null,
        release_date: this.releaseDate.trim() || null,
        genre: this.genre.trim() || null,
        duration_minutes: this.durationMinutes,
        poster_path: this.posterPath.trim() || null,
        video_url: this.videoUrl.trim() || null,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;

          if (response.success && response.movie?.id) {
            this.successMessage = response.message || 'Película creada correctamente';
            this.cdr.detectChanges();

            setTimeout(() => {
              this.router.navigate(['/reproducir'], {
                queryParams: { origen: 'db', id: response.movie!.id },
              });
            }, 800);
            return;
          }

          this.errorMessage = response.message || 'No se pudo crear la película';
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error?.error?.message || 'Error al conectar con el servidor. Intenta nuevamente.';
          this.cdr.detectChanges();
        },
      });
  }

  volverAHome() {
    this.router.navigate(['/home']);
  }
}
