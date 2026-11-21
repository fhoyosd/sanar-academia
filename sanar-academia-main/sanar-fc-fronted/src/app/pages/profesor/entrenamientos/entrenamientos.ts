import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

export interface Entrenamiento {
  id: number;
  lugar: string;
  fecha_hora: string;
}

@Component({
  selector: 'app-entrenamientos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './entrenamientos.html',
  styleUrl: './entrenamientos.css'
})
export class EntrenamientosComponent implements OnInit {
  entrenamientos = signal<Entrenamiento[]>([]);
  cargando = signal<boolean>(true);
  errorMsj = signal<string>('');

  private API_URL = '/api/profesor';
  readonly adminMode: boolean;
  readonly base = '/';

  constructor(private http: HttpClient, router: Router) { this.adminMode = router.url.startsWith('/admin/'); }
  get panelBase(): string { return this.adminMode ? '/admin' : '/profesor'; }

  ngOnInit(): void {
    this.obtenerEntrenamientos();
  }

  obtenerEntrenamientos(): void {
    this.cargando.set(true);
    this.errorMsj.set('');

    this.http.get<any>(`${this.API_URL}/entrenamientos`).subscribe({
      next: (res) => {
        // Soporta respuesta directa en array o envuelta en { entrenamientos: [...] }
        const lista = Array.isArray(res) ? res : (res?.entrenamientos || []);
        this.entrenamientos.set(lista);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('Error al obtener entrenamientos:', err);
        this.errorMsj.set('No se pudo conectar con el servidor.');
        this.cargando.set(false);
      }
    });
  }
}