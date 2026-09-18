import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-pagos-general',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './pagos-general.html',
  styleUrl: './pagos-general.css'
})
export class PagosGeneralComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  jugadores: any[] = [];
  mensajeError: string = '';

  ngOnInit(): void {
    this.obtenerJugadores();
  }

  obtenerJugadores(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/jugadores')
      .subscribe({
        next: (data) => {
          this.jugadores = [...data];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener la lista de jugadores para pagos:', err);
          this.mensajeError = 'No se pudieron cargar los datos.';
        }
      });
  }
}