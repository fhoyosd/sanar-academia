import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

/** HU001 – Registro de usuario (queda con rol acudiente). */
@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: '../login/login.css'
})
export class RegistroComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  datos = { nombre: '', username: '', password: '', confirmar: '' };
  cargando = signal(false);
  error = signal('');

  registrar(): void {
    const d = this.datos;
    if (!d.nombre.trim() || !d.username.trim() || !d.password) {
      this.error.set('Completa todos los campos.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.username.trim())) {
      this.error.set('Ingresa un correo electrónico válido.');
      return;
    }
    if (d.password.length < 6) {
      this.error.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (d.password !== d.confirmar) {
      this.error.set('Las contraseñas no coinciden.');
      return;
    }
    this.cargando.set(true);
    this.error.set('');
    this.auth.registrar({ nombre: d.nombre.trim(), username: d.username.trim(), password: d.password }).subscribe({
      next: res => {
        this.cargando.set(false);
        this.router.navigateByUrl(this.auth.rutaInicio(res.user.rol));
      },
      error: err => {
        this.cargando.set(false);
        this.error.set(err.error?.error || 'No se pudo crear la cuenta.');
      }
    });
  }
}
