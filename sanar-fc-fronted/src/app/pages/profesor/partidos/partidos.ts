import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-partidos',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './partidos.html',
  styleUrl: './partidos.css'
})
export class PartidosComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  profesorId: number = 1;
  partidos: any[] = [];
  cargando: boolean = true;
  mensajeError: string = '';

  ngOnInit(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      const usuarioStorage = localStorage.getItem('usuario');
      if (usuarioStorage) {
        try {
          const user = JSON.parse(usuarioStorage);
          if (user.id) this.profesorId = user.id;
        } catch (e) {
          console.error('Error parseando usuario:', e);
        }
      }
    }
    this.cargarPartidos();
  }

  cargarPartidos(): void {
    this.http.get<any[]>(`http://127.0.0.1:5000/api/profesor/partidos/${this.profesorId}`)
      .subscribe({
        next: (data) => {
          this.partidos = data;
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar partidos:', err);
          this.mensajeError = 'No se pudieron obtener los partidos.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }
}