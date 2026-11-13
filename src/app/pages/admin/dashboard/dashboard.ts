import { Component, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth';

interface Conteo {
  usuarios: number; jugadores: number; categorias: number; profesores: number; acudientes: number;
  eventos: number; avisos: number; pagos_pendientes: number; valor_pendiente: number; recaudado: number;
}

/** HU011 – Panel de administración de la plataforma. */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css'
})
export class DashboardComponent {
  private http = inject(HttpClient);
  readonly auth = inject(AuthService);

  conteo = signal<Conteo | null>(null);
  error = signal('');

  readonly accesos = [
    { ruta: '/admin/usuarios', icono: 'bi-people-fill', tono: 'tone-blue', titulo: 'Usuarios', texto: 'Administra entrenadores, acudientes y administradores.' },
    { ruta: '/admin/jugadores', icono: 'bi-person-badge-fill', tono: 'tone-green', titulo: 'Estudiantes', texto: 'Inscribe, actualiza y consulta las fichas de los jugadores.' },
    { ruta: '/admin/categorias', icono: 'bi-diagram-3-fill', tono: 'tone-violet', titulo: 'Categorías y entrenadores', texto: 'Crea grupos y asigna el entrenador responsable.' },
    { ruta: '/admin/entrenamientos', icono: 'bi-calendar-check-fill', tono: 'tone-blue', titulo: 'Entrenamientos', texto: 'Consulta y administra las sesiones de entrenamiento.' },
    { ruta: '/admin/partidos', icono: 'bi-trophy-fill', tono: 'tone-amber', titulo: 'Partidos', texto: 'Programa y consulta los partidos de la escuela.' },
    { ruta: '/admin/pagos', icono: 'bi-cash-coin', tono: 'tone-amber', titulo: 'Pagos', texto: 'Registra cobros y actualiza su estado.' },
    { ruta: '/admin/avisos', icono: 'bi-megaphone-fill', tono: 'tone-red', titulo: 'Avisos institucionales', texto: 'Publica información para toda la comunidad.' },
    { ruta: '/admin/crear-jugador', icono: 'bi-person-plus-fill', tono: 'tone-lime', titulo: 'Inscribir jugador', texto: 'Registra un nuevo estudiante en la escuela.' }
  ];

  constructor() {
    this.http.get<Conteo>('/api/admin/dashboard').subscribe({
      next: c => this.conteo.set(c),
      error: () => this.error.set('No se pudieron cargar las estadísticas.')
    });
  }

  saludo(): string {
    const h = new Date().getHours();
    return h < 12 ? 'Buenos días' : h < 19 ? 'Buenas tardes' : 'Buenas noches';
  }
}
