
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AcudienteService } from '../../../services/acudiente';

@Component({
  selector: 'app-dashboard-acudiente',
  standalone: true,
  imports: [CommonModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './dashboard-acudiente.html',
  styleUrl: './dashboard-acudiente.css'
})
export class DashboardAcudienteComponent implements OnInit {
  private acudienteService = inject(AcudienteService);
  private cdr = inject(ChangeDetectorRef);

  datos: any = null;
  cargando = true;
  error = '';
  seccion = 'inicio';

  ngOnInit(): void {
    console.log('[Acudiente] Iniciando consulta del dashboard');

    this.acudienteService.obtenerDashboard().subscribe({
      next: (res) => {
        console.log('[Acudiente] Respuesta recibida:', res);

        this.datos = res;
        this.cargando = false;
        this.cdr.detectChanges();

        console.log('[Acudiente] Vista actualizada');
      },
      error: (err) => {
        console.error('[Acudiente] Error al cargar dashboard:', err);

        this.error = err.status === 401
          ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
          : 'No fue posible cargar la información. Intenta nuevamente.';

        this.cargando = false;
        this.cdr.detectChanges();
      },
      complete: () => {
        console.log('[Acudiente] Petición HTTP completada');
      }
    });
  }

  cambiarSeccion(seccion: string): void {
    this.seccion = seccion;
  }

  nombreHijo(id: number): string {
    return this.datos?.hijos?.find(
      (h: any) => h.id === id
    )?.nombre || 'Estudiante';
  }

  estadoClase(estado: string): string {
    const valor = (estado || '').toLowerCase();

    if (['pagado', 'completado', 'asistio', 'presente'].includes(valor)) {
      return 'success';
    }

    if (['atrasado', 'vencido', 'no asistio', 'ausente', 'falta'].includes(valor)) {
      return 'danger';
    }

    return 'warning';
  }
}
