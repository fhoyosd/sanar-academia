import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-crear-entrenamiento',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crear-entrenamiento.html',
  styleUrl: './crear-entrenamiento.css'
})
export class CrearEntrenamientoComponent implements OnInit {
  categorias: any[] = []; 

  nuevoEntrenamiento = {
    fecha: '',
    lugar: '',
    categoria_id: null,
    actividades: ''
  };

  guardando: boolean = false;
  errorMsj: string = '';

  private API_URL = 'http://127.0.0.1:5000/api/profesor';

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    // Agregamos { withCredentials: true } para que envíe la sesión a Flask
    this.http.get<any>(`${this.API_URL}/categorias`, { withCredentials: true }).subscribe({
      next: (res) => {
        // Formateamos por si viene un arreglo directo o un objeto con categorias
        const lista = Array.isArray(res) ? res : (res?.categorias || []);
        this.categorias = lista;
        
        if (this.categorias.length > 0) {
          this.nuevoEntrenamiento.categoria_id = this.categorias[0].id;
        }
      },
      error: (err) => {
        console.error('Error al cargar categorías:', err);
        this.errorMsj = 'No se pudieron cargar las categorías del profesor.';
      }
    });
  }

  guardarEntrenamiento(): void {
    if (!this.nuevoEntrenamiento.categoria_id) {
      this.errorMsj = 'Debes seleccionar una categoría.';
      return;
    }

    this.guardando = true;

    // También enviamos withCredentials aquí para guardar correctamente
    this.http.post(`${this.API_URL}/crear_entrenamiento`, this.nuevoEntrenamiento, { withCredentials: true }).subscribe({
      next: () => {
        this.guardando = false;
        this.router.navigate(['/profesor/entrenamientos']);
      },
      error: (err) => {
        console.error('Error al guardar:', err);
        this.errorMsj = 'Error al guardar el entrenamiento.';
        this.guardando = false;
      }
    });
  }
}