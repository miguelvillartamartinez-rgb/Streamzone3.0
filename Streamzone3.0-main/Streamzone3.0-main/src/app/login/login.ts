import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  password: string = '';
  loading: boolean = false;
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, completa todos los campos';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.cdr.detectChanges();

    try {
      const result = await this.authService.login(this.email.trim(), this.password);
      if (result.success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = result.message || 'Email o contraseña incorrectos';
      }
    } catch (error) {
      this.errorMessage = 'Error al conectar con el servidor. Intenta nuevamente.';
      console.error('[StreamZone] Error en login:', error);
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }
}
