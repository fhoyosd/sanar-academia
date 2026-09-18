import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pago-detalle',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './pago-detalle.html',
  styleUrl: './pago-detalle.css'
})
export class PagoDetalleComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  jugadorId: number = 0;
  mensajeExito: string = '';
  mensajeError: string = '';

  jugador = {
    id: 0,
    nombre: ''
  };

  nuevoPago = {
    mes: 'Septiembre 2026',
    monto: 50000
  };

  historial: any[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.jugadorId = Number(idParam);
      this.cargarDetallePagos();
    }
  }

  cargarDetallePagos(): void {
    this.http.get<any>(`http://127.0.0.1:5000/api/admin/jugadores/${this.jugadorId}/pagos`)
      .subscribe({
        next: (res) => {
          this.jugador = res.jugador;
          this.historial = [...res.historial];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar pagos:', err);
          this.mensajeError = 'No se pudo obtener el historial de pagos.';
        }
      });
  }

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    const payload = {
      mes: this.nuevoPago.mes,
      monto: this.nuevoPago.monto,
      fecha_pago: new Date().toISOString().split('T')[0]
    };

    this.http.post(`http://127.0.0.1:5000/api/admin/jugadores/${this.jugadorId}/pagos/nuevo`, payload)
      .subscribe({
        next: () => {
          this.mensajeExito = 'Pago registrado exitosamente.';
          this.cargarDetallePagos();
        },
        error: (err) => {
          console.error('Error al guardar el pago:', err);
          this.mensajeError = 'Error al registrar el pago en el servidor.';
        }
      });
  }
}