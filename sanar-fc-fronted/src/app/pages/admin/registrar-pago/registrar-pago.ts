import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-registrar-pago',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './registrar-pago.html',
  styleUrl: './registrar-pago.css'
})
export class RegistrarPagoComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  mensajeExito: string = '';
  mensajeError: string = '';
  guardando: boolean = false;

  jugadores: any[] = [];

  motivos: string[] = ['Mensualidad', 'Inscripción', 'Uniforme', 'Torneo', 'Otro'];

  meses: string[] = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  anios: number[] = [
    new Date().getFullYear() - 1,
    new Date().getFullYear(),
    new Date().getFullYear() + 1
  ];

  pago = {
    jugador_id: '',
    categoria: '',
    motivo: 'Mensualidad',
    motivo_otro: '',
    mes: this.meses[new Date().getMonth()],
    anio: new Date().getFullYear(),
    monto: null as number | null
  };

  ngOnInit(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/jugadores')
      .subscribe({
        next: (data) => {
          this.jugadores = [...data];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar jugadores:', err);
          this.mensajeError = 'No se pudo cargar la lista de jugadores.';
        }
      });
  }

  // Al elegir el jugador, se completa su categoría automáticamente
  onJugadorChange(): void {
    const j = this.jugadores.find(x => x.id === Number(this.pago.jugador_id));
    this.pago.categoria = j ? j.categoria : '';
  }

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    let motivoFinal = this.pago.motivo;
    if (this.pago.motivo === 'Otro') {
      motivoFinal = this.pago.motivo_otro.trim();
    } else if (this.pago.motivo === 'Mensualidad') {
      motivoFinal = `Mensualidad ${this.pago.mes} ${this.pago.anio}`;
    }

    if (!this.pago.jugador_id) {
      this.mensajeError = 'Selecciona un jugador.';
      return;
    }
    if (!motivoFinal) {
      this.mensajeError = 'Indica el motivo del pago.';
      return;
    }
    if (!this.pago.monto || this.pago.monto <= 0) {
      this.mensajeError = 'Ingresa un monto válido.';
      return;
    }

    const payload = {
      jugador_id: Number(this.pago.jugador_id),
      motivo: motivoFinal,
      monto: this.pago.monto,
      fecha_pago: new Date().toISOString().split('T')[0]
    };

    this.guardando = true;
    this.http.post('http://127.0.0.1:5000/api/admin/pagos/nuevo', payload)
      .subscribe({
        next: () => {
          this.guardando = false;
          this.mensajeExito = 'Pago registrado exitosamente.';
          this.cdr.detectChanges();
          setTimeout(() => this.router.navigate(['/admin/pagos']), 1500);
        },
        error: (err) => {
          this.guardando = false;
          console.error('Error al registrar el pago:', err);
          this.mensajeError = err.error?.error || 'No se pudo registrar el pago.';
          this.cdr.detectChanges();
        }
      });
  }
}
