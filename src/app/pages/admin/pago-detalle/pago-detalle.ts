import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ESTADOS_PAGO } from '../pagos-general/pagos-general';

/** Historial de pagos de un jugador + registro rápido de cobro (HU024/HU025). */
@Component({
  selector: 'app-pago-detalle',
  standalone: true,
  imports: [FormsModule, RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './pago-detalle.html',
  styleUrl: '../pagos-general/pagos-general.css'
})
export class PagoDetalleComponent {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  readonly estados = ESTADOS_PAGO;
  jugadorId = Number(this.route.snapshot.paramMap.get('id'));
  jugador = signal<{ id: number; nombre: string }>({ id: 0, nombre: '' });
  historial = signal<any[]>([]);
  mensajeExito = signal('');
  mensajeError = signal('');

  nuevoPago = { mes: this.mesActual(), monto: 50000, estado: 'Pendiente' };

  readonly saldo = computed(() =>
    this.historial().filter(p => p.estado !== 'Pagado').reduce((s, p) => s + (p.monto || 0), 0));

  constructor() {
    if (this.jugadorId) this.cargarDetallePagos();
  }

  private mesActual(): string {
    const f = new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' }).replace(' de ', ' ');
    return 'Mensualidad ' + f.charAt(0).toUpperCase() + f.slice(1);
  }

  cargarDetallePagos(): void {
    this.http.get<any>(`/api/admin/jugadores/${this.jugadorId}/pagos`).subscribe({
      next: res => { this.jugador.set(res.jugador); this.historial.set(res.historial); },
      error: () => this.mensajeError.set('No se pudo obtener el historial de pagos.')
    });
  }

  onSubmit(): void {
    this.mensajeExito.set('');
    this.mensajeError.set('');
    if (!this.nuevoPago.mes.trim() || !this.nuevoPago.monto || this.nuevoPago.monto <= 0) {
      this.mensajeError.set('Indica el concepto y un monto válido.');
      return;
    }
    const payload = { ...this.nuevoPago, fecha_pago: new Date().toISOString().split('T')[0] };
    this.http.post(`/api/admin/jugadores/${this.jugadorId}/pagos/nuevo`, payload).subscribe({
      next: () => { this.mensajeExito.set('Cobro registrado exitosamente.'); this.cargarDetallePagos(); },
      error: err => this.mensajeError.set(err.error?.error || 'Error al registrar el pago en el servidor.')
    });
  }

  cambiarEstado(pago: any, estado: string): void {
    this.http.put(`/api/admin/pagos/${pago.id}/estado`, { estado }).subscribe({
      next: () => this.historial.update(l => l.map(p => p.id === pago.id ? { ...p, estado } : p)),
      error: () => this.mensajeError.set('No se pudo actualizar el estado.')
    });
  }
}
