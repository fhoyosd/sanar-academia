import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-editar-jugador',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './editar-jugador.html',
  styleUrl: './editar-jugador.css'
})
export class EditarJugadorComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  jugadorId: number = 0;
  mensajeExito: string = '';
  mensajeError: string = '';

  jugador: any = {
    nombre: '',
    fecha_nacimiento: '',
    estatura: null,
    peso: null,
    posicion: '',
    acudiente_id: '',
    categoria_id: ''
  };

  categorias: any[] = [];
  acudientes: any[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.jugadorId = Number(idParam);
      this.cargarListasAuxiliares();
      this.cargarJugador();
    }
  }

  cargarListasAuxiliares(): void {
    // Carga desplegable de Categorías
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/categorias')
      .subscribe({
        next: (data) => {
          this.categorias = data;
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al obtener categorías:', err)
      });

    // Carga desplegable de Acudientes
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/usuarios')
      .subscribe({
        next: (data) => {
          this.acudientes = data.filter(u => u.rol === 'acudiente');
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error al obtener acudientes:', err)
      });
  }

  cargarJugador(): void {
    this.http.get<any>(`http://127.0.0.1:5000/api/admin/jugadores/${this.jugadorId}`)
      .subscribe({
        next: (data) => {
          this.jugador = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar jugador:', err);
          this.mensajeError = 'No se pudo cargar la información del jugador.';
        }
      });
  }

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.http.put(`http://127.0.0.1:5000/api/admin/jugadores/editar/${this.jugadorId}`, this.jugador)
      .subscribe({
        next: () => {
          this.mensajeExito = 'Jugador actualizado correctamente.';
          setTimeout(() => this.router.navigate(['/admin/jugadores']), 1500);
        },
        error: (err) => {
          console.error('Error al actualizar jugador:', err);
          this.mensajeError = 'No se pudo guardar la información.';
        }
      });
  }
}