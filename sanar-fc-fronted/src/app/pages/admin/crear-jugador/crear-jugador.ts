import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-crear-jugador',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './crear-jugador.html',
  styleUrl: './crear-jugador.css'
})
export class CrearJugadorComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  isEditing: boolean = false;
  mensajeExito: string = '';
  mensajeError: string = '';

  jugador = {
    nombre: '',
    fecha_nacimiento: '',
    estatura: null,
    peso: null,
    posicion: 'Mediocampista',
    acudiente_id: '',
    categoria_id: ''
  };

  acudientes: any[] = [];
  categorias: any[] = [];

  ngOnInit(): void {
    this.cargarSelects();
  }

  cargarSelects(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/acudientes')
      .subscribe({
        next: (data) => {
          this.acudientes = data;
          console.log('ACUDIENTES RECIBIDOS:', data);
          console.log('ACUDIENTE ID 18:', data.find(a => Number(a.id) === 18));
        },
        error: (err) => console.error('Error al cargar acudientes:', err)
      });

    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/categorias')
      .subscribe({
        next: (data) => {
          this.categorias = data;
          console.log('CATEGORÍAS RECIBIDAS:', data);
        },
        error: (err) => console.error('Error al cargar categorías:', err)
      });
  }

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    console.log('DATOS QUE SE ENVIARÁN:', this.jugador);
    console.log('ACUDIENTE SELECCIONADO:', this.jugador.acudiente_id);

    this.http.post('http://127.0.0.1:5000/api/admin/jugadores/nuevo', this.jugador)
      .subscribe({
        next: () => {
          this.mensajeExito = 'Jugador registrado exitosamente';
          setTimeout(() => this.router.navigate(['/admin/jugadores']), 1500);
        },
        error: (err) => {
          console.error('Error al crear jugador:', err);
          this.mensajeError = err.error?.error || 'No se pudo registrar el jugador';
        }
      });
  }
}
