import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-jugadores',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './jugadores.html',
  styleUrl: './jugadores.css'
})
export class JugadoresComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  profesorId: number = 1;
  jugadores: any[] = [];
  cargando: boolean = true;
  mensajeError: string = '';

  ngOnInit(): void {
    // Verificación segura para evitar el error de SSR con localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const usuarioStorage = localStorage.getItem('usuario');
      if (usuarioStorage) {
        try {
          const user = JSON.parse(usuarioStorage);
          if (user.id) {
            this.profesorId = user.id;
          }
        } catch (e) {
          console.error('Error parseando usuario del storage:', e);
        }
      }
    }
    this.cargarJugadores();
  }

  cargarJugadores(): void {
    this.http.get<any[]>(`http://127.0.0.1:5000/api/profesor/jugadores/${this.profesorId}`)
      .subscribe({
        next: (data) => {
          this.jugadores = data;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener jugadores:', err);
          this.mensajeError = 'No se pudieron cargar los jugadores.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }
}