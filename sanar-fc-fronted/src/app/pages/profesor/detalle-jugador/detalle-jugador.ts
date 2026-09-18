import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-detalle-jugador',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-jugador.html',
  styleUrl: './detalle-jugador.css'
})
export class DetalleJugadorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  jugadorId!: number;
  profesorId: number = 1;

  jugador: any = null;
  observaciones: any[] = [];
  cargando: boolean = true;
  mensajeExito: string = '';
  mensajeError: string = '';

  nuevaObservacion = {
    rendimiento: 'Excelente',
    fortalezas: '',
    aspectosMejorar: '',
    comentario: ''
  };

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const usuarioStorage = localStorage.getItem('usuario');
      if (usuarioStorage) {
        try {
          const user = JSON.parse(usuarioStorage);
          if (user.id) this.profesorId = user.id;
        } catch (e) {
          console.error('Error al leer usuario del localStorage:', e);
        }
      }
    }

    this.jugadorId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.jugadorId) {
      this.cargarDetalle();
    }
  }

  cargarDetalle(): void {
    this.http.get<any>(`http://127.0.0.1:5000/api/profesor/jugador/${this.jugadorId}`)
      .subscribe({
        next: (res) => {
          this.jugador = res.jugador;
          // Mapeamos los datos recibidos del backend
          this.observaciones = (res.observaciones || []).map((obs: any) => ({
            rendimiento: obs.rendimiento,
            fortalezas: obs.fortalezas,
            aspectosMejorar: obs.aspectos_mejorar,
            comentario: obs.comentario
          }));
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener perfil del jugador:', err);
          this.mensajeError = 'No se pudo cargar la información del jugador.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }

  guardarObservacion(): void {
    if (!this.nuevaObservacion.fortalezas && !this.nuevaObservacion.comentario) {
      this.mensajeError = 'Por favor complete los campos obligatorios.';
      return;
    }

    this.mensajeError = '';
    this.mensajeExito = '';

    const payload = {
      comentario: this.nuevaObservacion.comentario,
      fortalezas: this.nuevaObservacion.fortalezas,
      aspectos_mejorar: this.nuevaObservacion.aspectosMejorar,
      rendimiento: this.nuevaObservacion.rendimiento,
      profesor_id: this.profesorId
    };

    this.http.post(`http://127.0.0.1:5000/api/profesor/jugador/${this.jugadorId}/observacion`, payload)
      .subscribe({
        next: () => {
          this.mensajeExito = 'Observación guardada correctamente.';
          this.cargarDetalle();
          this.nuevaObservacion = {
            rendimiento: 'Excelente',
            fortalezas: '',
            aspectosMejorar: '',
            comentario: ''
          };
        },
        error: (err) => {
          console.error('Error al guardar observación:', err);
          this.mensajeError = 'Error al guardar la observación.';
          this.cdr.detectChanges();
        }
      });
  }
}