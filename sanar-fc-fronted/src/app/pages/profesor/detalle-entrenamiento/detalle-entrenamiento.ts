import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-detalle-entrenamiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-entrenamiento.html',
  styleUrl: './detalle-entrenamiento.css'
})
export class DetalleEntrenamientoComponent implements OnInit, OnDestroy {
  entrenamientoId: number | null = null;
  entrenamiento: any = null;
  jugadores: any[] = [];
  asistencias: any[] = [];

  cargando: boolean = true;
  errorMsj: string = '';
  guardandoMap: { [jugadorId: number]: boolean } = {};

  private sub!: Subscription;
  private API_URL = 'http://127.0.0.1:5000/api/profesor';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient,
    private location: Location,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.cargando = false;
      return;
    }

    const idFromSnapshot = this.route.snapshot.paramMap.get('id');

    if (idFromSnapshot) {
      this.entrenamientoId = Number(idFromSnapshot);
      this.cargarDatos();
    } else {
      this.sub = this.route.params.subscribe({
        next: (params) => {
          const id = params['id'];
          if (id) {
            this.entrenamientoId = Number(id);
            this.cargarDatos();
          } else {
            this.errorMsj = 'URL inválida: Falta el parámetro ID';
            this.cargando = false;
            this.cdr.detectChanges();
          }
        },
        error: () => {
          this.errorMsj = 'Error al obtener parámetros de la ruta.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  cargarDatos(): void {
    if (!this.entrenamientoId) {
      this.cargando = false;
      this.cdr.detectChanges();
      return;
    }

    this.cargando = true;
    this.errorMsj = '';
    this.cdr.detectChanges();

    this.http.get<any>(`${this.API_URL}/entrenamiento-detalle/${this.entrenamientoId}`, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.cargando = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (data) => {
          this.entrenamiento = data?.entrenamiento || (data?.id ? data : null);
          this.asistencias = data?.asistencias || [];

          const lista = data?.jugadores || [];
          this.jugadores = lista.map((j: any) => {
            if (!j) return null;
            const reg = this.asistencias.find(a => a && a.jugador_id === j.id);
            return {
              ...j,
              registrado: !!reg,
              asistio: reg ? (reg.estado === 'asistio') : false
            };
          }).filter(Boolean);
        },
        error: (err) => {
          console.error('Error al obtener datos:', err);
          this.errorMsj = `Error de conexión con el servidor (${err.status || 500}).`;
        }
      });
  }

  volver(): void {
    this.location.back();
  }

  guardarAsistencia(jugador: any): void {
    if (!this.entrenamientoId || !jugador) return;

    const estado = jugador.asistio ? 'asistio' : 'no_asistio';
    this.guardandoMap[jugador.id] = true;
    this.cdr.detectChanges();

    const body = {
      entrenamiento_id: this.entrenamientoId,
      jugador_id: jugador.id,
      estado: estado
    };

    this.http.post(`${this.API_URL}/asistencias`, body, { withCredentials: true })
      .pipe(
        finalize(() => {
          this.guardandoMap[jugador.id] = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: () => {
          jugador.registrado = true;

          const idx = this.asistencias.findIndex(a => a && a.jugador_id === jugador.id);
          if (idx !== -1) {
            this.asistencias[idx].estado = estado;
          } else {
            this.asistencias.push({
              jugador_id: jugador.id,
              estado: estado,
              jugador: { nombre: jugador.nombre, posicion: jugador.posicion }
            });
          }
        },
        error: (err) => {
          console.error('Error al guardar asistencia:', err);
          const msg = err.error?.error || err.error?.mensaje || `Error ${err.status || 500}`;
          alert(`No se pudo guardar la asistencia: ${msg}`);
        }
      });
  }

  ngOnDestroy(): void {
    if (this.sub) {
      this.sub.unsubscribe();
    }
  }
}