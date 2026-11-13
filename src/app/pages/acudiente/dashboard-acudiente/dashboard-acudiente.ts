import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AcudienteService } from '../../../services/acudiente';

@Component({
  selector: 'app-dashboard-acudiente',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, CurrencyPipe, DatePipe],
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
  mostrarFormularioPago = false;
  pago = { jugador_id: '', mes: '', monto: 0, metodo: 'Transferencia', referencia: '' };
  guardandoPago = false;
  mensajePago = '';
  errorPago = '';

  ngOnInit(): void {
    this.acudienteService.obtenerDashboard().subscribe({
      next: (res) => { this.datos = res; this.cargando = false; this.cdr.markForCheck(); },
      error: (err) => {
        this.error = err.status === 401
          ? 'Tu sesión ha expirado. Inicia sesión nuevamente.'
          : 'No fue posible cargar la información. Intenta nuevamente.';
        this.cargando = false;
        this.cdr.markForCheck();
      }
    });
  }

  cambiarSeccion(seccion: string): void { this.seccion = seccion; }

  reportarPago(): void {
    this.mensajePago = ''; this.errorPago = '';
    if (!this.pago.jugador_id || !this.pago.mes.trim() || !this.pago.monto || this.pago.monto <= 0) {
      this.errorPago = 'Selecciona el estudiante e ingresa el concepto y el valor del pago.'; return;
    }
    this.guardandoPago = true;
    this.acudienteService.reportarPago({ ...this.pago, jugador_id: Number(this.pago.jugador_id) }).subscribe({
      next: (res) => {
        this.mensajePago = res.mensaje || 'Pago reportado. La escuela debe verificarlo.';
        this.mostrarFormularioPago = false; this.pago = { jugador_id: '', mes: '', monto: 0, metodo: 'Transferencia', referencia: '' };
        this.acudienteService.obtenerDashboard().subscribe({ next: data => { this.datos = data; this.cdr.markForCheck(); } });
        this.guardandoPago = false; this.cdr.markForCheck();
      },
      error: (err) => { this.errorPago = err.error?.error || 'No fue posible reportar el pago.'; this.guardandoPago = false; this.cdr.markForCheck(); }
    });
  }

  estadoTexto(estado: string): string {
    const v = (estado || '').toLowerCase();
    if (v === 'asistio') return 'Asistió';
    if (v === 'no_asistio') return 'No asistió';
    return estado;
  }

  nombreHijo(id: number): string {
    return this.datos?.hijos?.find((h: any) => h.id === id)?.nombre || 'Estudiante';
  }

  estadoClase(estado: string): string {
    const valor = (estado || '').toLowerCase();
    if (['pagado', 'completado', 'asistio', 'presente'].includes(valor)) return 'success';
    if (['atrasado', 'vencido', 'no asistio', 'no_asistio', 'ausente', 'falta'].includes(valor)) return 'danger';
    return 'warning';
  }
}
