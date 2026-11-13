import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-crear-partido',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-partido.html',
  styleUrl: './crear-partido.css'
})
export class CrearPartidoComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  profesorId: number = 1;
  panelBase = '/profesor';
  guardando: boolean = false;
  cargandoDatos: boolean = true;
  mensajeError: string = '';

  partido = {
    rival: '',
    resultado: '',
    lugar: '',
    fecha: '',
    categoria_id: null as number | null,
    convocados: [] as number[]
  };

  categorias: any[] = [];
  jugadores: any[] = [];

  ngOnInit(): void {
    this.panelBase = this.router.url.startsWith('/admin/') ? '/admin' : '/profesor';
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
    this.cargarDatosIniciales();
  }

  cargarDatosIniciales(): void {
    // Cargamos la lista general de jugadores y categorías asignadas al profesor
    if (this.panelBase === '/admin') {
      Promise.all([
        this.http.get<any[]>('/api/admin/categorias').toPromise(),
        this.http.get<any[]>('/api/admin/jugadores').toPromise()
      ]).then(([categorias, jugadores]) => {
        this.categorias = categorias || [];
        this.jugadores = (jugadores || []).map(j => ({ ...j, categoria: j.categoria || '' }));
        if (this.categorias.length) this.partido.categoria_id = this.categorias[0].id;
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }).catch(err => {
        console.error('Error al cargar datos iniciales:', err);
        this.mensajeError = 'No se pudieron obtener las categorías o jugadores.';
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      });
      return;
    }
    this.http.get<any>(`/api/profesor/dashboard/${this.profesorId}`).subscribe({
      next: (res) => {
        this.categorias = res.categorias || [];
        this.jugadores = res.jugadores || [];
        if (this.categorias.length) this.partido.categoria_id = this.categorias[0].id;
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar datos iniciales:', err);
        this.mensajeError = 'No se pudieron obtener las categorías o jugadores.';
        this.cargandoDatos = false;
        this.cdr.detectChanges();
      }
    });
  }

  toggleJugador(id: number): void {
    const index = this.partido.convocados.indexOf(id);
    if (index > -1) {
      this.partido.convocados.splice(index, 1);
    } else {
      this.partido.convocados.push(id);
    }
  }

  onSubmit(): void {
    if (!this.partido.rival || !this.partido.categoria_id) {
      this.mensajeError = 'Por favor completa el nombre del rival y selecciona una categoría.';
      return;
    }

    this.guardando = true;
    this.mensajeError = '';

    const payload = {
      ...this.partido,
      profesor_id: this.profesorId
    };

    this.http.post('/api/profesor/partidos/nuevo', payload)
      .subscribe({
        next: () => {
          this.guardando = false;
          this.router.navigate([this.panelBase + '/partidos']);
        },
        error: (err) => {
          console.error('Error al crear el partido:', err);
          this.mensajeError = 'Ocurrió un error al intentar registrar el partido.';
          this.guardando = false;
          this.cdr.detectChanges();
        }
      });
  }
}