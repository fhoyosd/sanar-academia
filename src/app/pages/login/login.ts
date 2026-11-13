import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { username: '', password: '' };
  verPassword = signal(false);
  cargando = signal(false);
  errorMessage = signal('');

  onLogin(): void {
    if (!this.credentials.username.trim() || !this.credentials.password) {
      this.errorMessage.set('Ingresa tu usuario y contraseña.');
      return;
    }
    this.cargando.set(true);
    this.errorMessage.set('');

    // El AuthService guarda el usuario en una señal compartida:
    // por eso el menú superior se actualiza inmediatamente.
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        this.cargando.set(false);
        this.router.navigateByUrl(this.authService.rutaInicio(res.user.rol));
      },
      error: (err) => {
        this.cargando.set(false);
        this.errorMessage.set(
          err.status === 0 || err.status === 504
            ? 'No hay conexión con el servidor. Verifica que el backend esté encendido.'
            : err.error?.error || 'Error al iniciar sesión'
        );
      }
    });
  }
}
