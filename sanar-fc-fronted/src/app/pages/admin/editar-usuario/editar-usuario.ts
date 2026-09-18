import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-usuario',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './editar-usuario.html',
  styleUrl: './editar-usuario.css'
})
export class EditarUsuarioComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  userId!: number;
  
  usuario = {
    nombre: '',
    username: '',
    password: '',
    rol: 'profesor'
  };

  mensajeExito: string = '';
  mensajeError: string = '';

  ngOnInit(): void {
    this.userId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.userId) {
      this.cargarUsuario();
    }
  }

  cargarUsuario(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/usuarios')
      .subscribe({
        next: (usuarios) => {
          const userFound = usuarios.find(u => u.id === this.userId);
          if (userFound) {
            this.usuario = {
              nombre: userFound.nombre_completo || '',
              username: userFound.nombre_usuario || '',
              password: '',
              rol: userFound.rol || 'profesor'
            };
            this.cdr.detectChanges();
          }
        },
        error: (err) => console.error('Error al cargar datos:', err)
      });
  }

  onSubmit(): void {
    this.mensajeExito = '';
    this.mensajeError = '';

    this.http.put(`http://127.0.0.1:5000/api/admin/usuarios/editar/${this.userId}`, this.usuario)
      .subscribe({
        next: () => {
          this.mensajeExito = '¡Usuario actualizado con éxito!';
          setTimeout(() => this.router.navigate(['/admin/usuarios']), 1200);
        },
        error: (err) => {
          console.error('Error al actualizar:', err);
          this.mensajeError = 'Error al actualizar el usuario.';
        }
      });
  }
}