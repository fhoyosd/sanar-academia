import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard-profesor',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './dashboard-profesor.html',
  styleUrl: './dashboard-profesor.css'
})
export class DashboardProfesorComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  profesorId: number = 1;
  categorias: any[] = [];
  jugadores: any[] = [];
  cargando: boolean = true;
  mensajeError: string = '';

  ngOnInit(): void {
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
    this.cargarDashboard();
  }

  cargarDashboard(): void {
    this.http.get<any>(`http://127.0.0.1:5000/api/profesor/dashboard/${this.profesorId}`)
      .subscribe({
        next: (res) => {
          this.categorias = res.categorias || [];
          this.jugadores = res.jugadores || [];
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar dashboard del profesor:', err);
          this.mensajeError = 'No se pudo cargar la información del panel.';
          this.cargando = false;
          this.cdr.detectChanges();
        }
      });
  }
}