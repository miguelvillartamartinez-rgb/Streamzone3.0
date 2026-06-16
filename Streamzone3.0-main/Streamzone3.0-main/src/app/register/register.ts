import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: '../login/login.css',
})
export class Register {
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async onSubmit() {
    const trimmedUsername = this.username.trim();
    const trimmedEmail = this.email.trim();

    if (!trimmedUsername || !trimmedEmail || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.cdr.detectChanges();
      return;
    }

    if (trimmedUsername.length < 2) {
      this.errorMessage = 'El nombre de usuario debe tener al menos 2 caracteres';
      this.cdr.detectChanges();
      return;
    }

    if (trimmedUsername.length > 50) {
      this.errorMessage = 'El nombre de usuario no puede superar 50 caracteres';
      this.cdr.detectChanges();
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.cdr.detectChanges();
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      const result = await this.authService.register(
        trimmedUsername,
        trimmedEmail,
        this.password
      );

      if (result.success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = result.message || 'No se pudo completar el registro';
      }
    } catch (error) {
      this.errorMessage = 'Error al conectar con el servidor. Intenta nuevamente.';
      console.error('[StreamZone] Error en registro:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
