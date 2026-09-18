import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-detalle-partido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './detalle-partido.html',
  styleUrl: './detalle-partido.css'
})
export class DetallePartidoComponent implements OnInit {
  partidoId = signal<number>(0);
  partido = signal<any>(null);
  jugadoresStats = signal<any[]>([]);
  cargando = signal<boolean>(true);
  errorMsj = signal<string>('');

  private API_URL = 'http://127.0.0.1:5000/api/profesor';

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const parsedId = Number(id);

    if (parsedId) {
      this.partidoId.set(parsedId);
      this.obtenerDatos();
    } else {
      this.errorMsj.set('No se encontró el ID en la URL');
      this.cargando.set(false);
    }
  }

  obtenerDatos(): void {
    this.cargando.set(true);

    this.http.get<any>(`${this.API_URL}/partido/${this.partidoId()}`).subscribe({
      next: (data) => {
        const partidoData = data?.partido || null;
        const jugadores = data?.jugadores || [];
        const stats = data?.estadisticas || [];

        const statsMapeadas = jugadores.map((j: any) => {
          const st = stats.find((s: any) => s.jugador_id === j.id) || {};
          return {
            jugador_id: j.id,
            nombre: j.nombre || 'Jugador',
            posicion: j.posicion || 'N/A',
            asistencia: st.asistencia ?? true,
            goles: st.goles ?? 0,
            asistencias: st.asistencias ?? 0,
            pases: st.pases ?? 0,
            amarillas: st.amarillas ?? 0,
            rojas: st.rojas ?? 0,
            guardando: false
          };
        });

        this.partido.set(partidoData);
        this.jugadoresStats.set(statsMapeadas);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.errorMsj.set('Error de conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  guardar(jugador: any): void {
    jugador.guardando = true;
    
    // Forzamos la actualización de la lista para deshabilitar el botón mientras guarda
    this.jugadoresStats.set([...this.jugadoresStats()]);

    const payload = {
      jugador_id: jugador.jugador_id,
      goles: jugador.goles,
      asistencias: jugador.asistencias,
      pases: jugador.pases,
      amarillas: jugador.amarillas,
      rojas: jugador.rojas,
      asistencia: jugador.asistencia
    };

    this.http.post(`${this.API_URL}/partido/${this.partidoId()}/estadisticas`, payload).subscribe({
      next: () => {
        jugador.guardando = false;
        this.jugadoresStats.set([...this.jugadoresStats()]);
        alert('Estadísticas guardadas con éxito');
      },
      error: () => {
        jugador.guardando = false;
        this.jugadoresStats.set([...this.jugadoresStats()]);
        alert('Error al guardar las estadísticas');
      }
    });
  }
}