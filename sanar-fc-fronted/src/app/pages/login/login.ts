import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth'; // Importación directa a auth

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  credentials = {
    username: '',
    password: ''
  };

  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  onLogin(): void {
    this.authService.login(this.credentials).subscribe({
      next: (res) => {
        // Usamos res.user en lugar de res.usuario
        localStorage.setItem('usuario', JSON.stringify(res.user));

        if (res.user.rol === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else if (res.user.rol === 'profesor') {
          this.router.navigate(['/profesor/dashboard']);
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.error || 'Error al iniciar sesión';
      }
    });
  }
}