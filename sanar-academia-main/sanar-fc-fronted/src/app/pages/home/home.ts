import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './home.css',
  templateUrl: './home.html',
})
export class Home {
  readonly auth = inject(AuthService);
  readonly anio = new Date().getFullYear();

  readonly features = [
    { icono: 'bi-shield-check', tono: 'tone-green', titulo: 'Entrenamiento seguro', texto: 'Instalaciones de primer nivel y protocolos de cuidado para que los jugadores solo se enfoquen en mejorar.' },
    { icono: 'bi-people', tono: 'tone-blue', titulo: 'Formación integral', texto: 'No solo formamos futbolistas: acompañamos el crecimiento personal y académico de cada estudiante.' },
    { icono: 'bi-graph-up-arrow', tono: 'tone-amber', titulo: 'Seguimiento digital', texto: 'Asistencia, evaluaciones, convocatorias y mensualidades disponibles en tiempo real para las familias.' }
  ];

  readonly roles = [
    { icono: 'bi-briefcase', titulo: 'Administración', items: ['Usuarios, jugadores y categorías', 'Asignación de entrenadores', 'Pagos y avisos institucionales'] },
    { icono: 'bi-stopwatch', titulo: 'Entrenadores', items: ['Entrenamientos y partidos', 'Convocatorias y asistencia', 'Observaciones y evaluaciones'] },
    { icono: 'bi-house-heart', titulo: 'Acudientes', items: ['Información de sus hijos', 'Asistencia y desempeño', 'Historial de pagos y avisos'] }
  ];
}
