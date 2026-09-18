import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-crear-categoria',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './crear-categoria.html'
})
export class CrearCategoriaComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  mensajeExito: string = '';
  mensajeError: string = '';

  categoria = {
    nombre: '',
    profesor_id: ''
  };

  profesores: any[] = [];

  ngOnInit(): void {
    this.cargarProfesores();
  }

  cargarProfesores(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/profesores')
      .subscribe({
        next: (data) => {
          this.profesores = data;
        },
        error: (err) => {
          console.error('Error al cargar profesores:', err);
          this.mensajeError = 'No se pudieron cargar los profesores registrados.';
        }
      });
  }

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    if (!this.categoria.nombre || !this.categoria.profesor_id) {
      this.mensajeError = 'Por favor completa todos los campos requeridos.';
      return;
    }

    this.http.post('http://127.0.0.1:5000/api/admin/categorias/nueva', this.categoria)
      .subscribe({
        next: () => {
          this.mensajeExito = 'Categoría creada con éxito';
          setTimeout(() => this.router.navigate(['/admin/dashboard']), 1500);
        },
        error: (err) => {
          console.error('Error al crear categoría:', err);
          this.mensajeError = 'No se pudo crear la categoría';
        }
      });
  }
}