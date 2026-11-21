import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from './services/auth';

interface NavLink { ruta: string; texto: string; icono: string; }

const MENU: Record<string, NavLink[]> = {
  admin: [
    { ruta: '/admin/dashboard', texto: 'Inicio', icono: 'bi-grid-1x2' },
    { ruta: '/admin/usuarios', texto: 'Usuarios', icono: 'bi-people' },
    { ruta: '/admin/jugadores', texto: 'Jugadores', icono: 'bi-person-badge' },
    { ruta: '/admin/categorias', texto: 'Categorías', icono: 'bi-diagram-3' },
    { ruta: '/admin/pagos', texto: 'Pagos', icono: 'bi-cash-coin' },
    { ruta: '/admin/avisos', texto: 'Avisos', icono: 'bi-megaphone' }
  ],
  profesor: [
    { ruta: '/profesor/dashboard', texto: 'Inicio', icono: 'bi-grid-1x2' },
    { ruta: '/profesor/jugadores', texto: 'Jugadores', icono: 'bi-people' },
    { ruta: '/profesor/entrenamientos', texto: 'Entrenamientos', icono: 'bi-stopwatch' },
    { ruta: '/profesor/partidos', texto: 'Partidos', icono: 'bi-trophy' },
    { ruta: '/profesor/avisos', texto: 'Notificaciones', icono: 'bi-bell' }
  ],
  acudiente: [
    { ruta: '/acudiente/dashboard', texto: 'Mi panel', icono: 'bi-house-heart' }
  ]
};

const ROL_TEXTO: Record<string, string> = {
  admin: 'Administrador',
  profesor: 'Entrenador',
  acudiente: 'Acudiente'
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly auth = inject(AuthService);
  private router = inject(Router);

  readonly menuAbierto = signal(false);
  readonly perfilAbierto = signal(false);
  readonly anio = new Date().getFullYear();

  readonly enlaces = computed(() => MENU[this.auth.rol() ?? ''] ?? []);
  readonly rolTexto = computed(() => ROL_TEXTO[this.auth.rol() ?? ''] ?? '');

  constructor() {
    // Cierra los menús desplegables al cambiar de página.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.menuAbierto.set(false);
      this.perfilAbierto.set(false);
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
