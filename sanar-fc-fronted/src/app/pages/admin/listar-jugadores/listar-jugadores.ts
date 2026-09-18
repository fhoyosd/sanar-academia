import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-listar-jugadores',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './listar-jugadores.html',
  styleUrl: './listar-jugadores.css'
})
export class ListarJugadoresComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  jugadores: any[] = [];
  mensajeExito: string = '';
  mensajeError: string = '';

  ngOnInit(): void {
    this.obtenerJugadores();
  }

  obtenerJugadores(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/jugadores')
      .subscribe({
        next: (data) => {
          this.jugadores = [...data]; // Creamos una nueva referencia de array
          this.cdr.detectChanges();   // Forzamos el renderizado en la plantilla
        },
        error: (err) => {
          console.error('Error al obtener jugadores:', err);
          this.mensajeError = 'No se pudo cargar la lista de jugadores.';
        }
      });
  }

  eliminarJugador(id: number): void {
    if (confirm('¿Estás seguro de que deseas eliminar este jugador?')) {
      this.http.delete(`http://127.0.0.1:5000/api/admin/jugadores/eliminar/${id}`)
        .subscribe({
          next: () => {
            this.mensajeExito = 'Jugador eliminado correctamente';
            this.obtenerJugadores();
          },
          error: (err) => {
            console.error('Error al eliminar jugador:', err);
            this.mensajeError = 'Error al intentar eliminar el jugador.';
          }
        });
    }
  }
}