import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export const ESTADOS_PAGO = ['Pendiente', 'Pagado', 'Atrasado'] as const;

interface Pago {
  id: number; monto: number; fecha_pago: string; concepto: string;
  estado: string; jugador_id: number; jugador_nombre: string; detalle_reporte?: string | null;
}

/** HU024 / HU025 – Control de cobros y su estado. */
@Component({
  selector: 'app-pagos-general',
  standalone: true,
  imports: [RouterLink, CurrencyPipe, DatePipe, FormsModule],
  templateUrl: './pagos-general.html',
  styleUrl: './pagos-general.css'
})
export class PagosGeneralComponent {
  private http = inject(HttpClient);

  readonly estados = ESTADOS_PAGO;
  pagos = signal<Pago[]>([]);
  jugadores = signal<any[]>([]);
  filtro = signal<string>('Todos');
  busqueda = signal('');
  cargando = signal(true);
  mensajeError = signal('');

  readonly filtrados = computed(() => {
    const f = this.filtro();
    const q = this.busqueda().trim().toLowerCase();
    return this.pagos().filter(p =>
      (f === 'Todos' || p.estado === f) &&
      (!q || p.jugador_nombre.toLowerCase().includes(q) || (p.concepto || '').toLowerCase().includes(q)));
  });

  readonly totales = computed(() => {
    const suma = (e: string) => this.pagos().filter(p => p.estado === e).reduce((s, p) => s + (p.monto || 0), 0);
    return { pagado: suma('Pagado'), pendiente: suma('Pendiente'), atrasado: suma('Atrasado') };
  });

  constructor() {
    this.http.get<Pago[]>('/api/admin/pagos').subscribe({
      next: data => { this.pagos.set(data.sort((a, b) => b.id - a.id)); this.cargando.set(false); },
      error: () => { this.mensajeError.set('No se pudieron cargar los pagos.'); this.cargando.set(false); }
    });
    this.http.get<any[]>('/api/admin/jugadores').subscribe({ next: j => this.jugadores.set(j) });
  }

  private recargarPagos(): void {
    this.http.get<Pago[]>('/api/admin/pagos').subscribe({ next: data => this.pagos.set(data.sort((a,b) => b.id-a.id)) });
  }

  cambiarEstado(pago: Pago, estado: string): void {
    const anterior = pago.estado;
    this.pagos.update(l => l.map(p => p.id === pago.id ? { ...p, estado } : p));
    this.http.put(`/api/admin/pagos/${pago.id}/estado`, { estado }).subscribe({
      error: () => {
        this.pagos.update(l => l.map(p => p.id === pago.id ? { ...p, estado: anterior } : p));
        this.mensajeError.set('No se pudo actualizar el estado.');
      }
    });
  }
}
