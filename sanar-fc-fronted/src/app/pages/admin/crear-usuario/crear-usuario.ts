import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './crear-usuario.html',
  styleUrl: './crear-usuario.css'
})
export class CrearUsuarioComponent {
  private http = inject(HttpClient);
  private router = inject(Router);

  usuario = {
    nombre: '',
    username: '',
    password: '',
    rol: 'profesor'
  };

  mensajeExito: string = '';
  mensajeError: string = '';

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    // Esta línea es la que envía la información al backend de Flask:
   this.http.post('http://127.0.0.1:5000/api/admin/usuarios/nuevo', this.usuario)
      .subscribe({
        next: () => {
          this.mensajeExito = '¡Usuario guardado con éxito en la base de datos!';
          this.usuario = { nombre: '', username: '', password: '', rol: 'profesor' };
        },
        error: () => {
          this.mensajeError = 'Error: no se pudo guardar el usuario.';
        }
      });
  }
}