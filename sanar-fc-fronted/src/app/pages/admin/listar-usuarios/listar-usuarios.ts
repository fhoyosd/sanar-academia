import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router'; // 1. Importado para habilitar [routerLink]
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-listar-usuarios',
  standalone: true,
  imports: [RouterLink, CommonModule], // 2. Registrado aquí para que el HTML reconozca la navegación
  templateUrl: './listar-usuarios.html',
  styleUrl: './listar-usuarios.css'
})
export class ListarUsuariosComponent implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  usuarios: any[] = [];

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.http.get<any[]>('http://127.0.0.1:5000/api/admin/usuarios')
      .subscribe({
        next: (data) => {
          this.usuarios = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al obtener usuarios:', err);
        }
      });
  }

  eliminarUsuario(id: number): void {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      // Petición DELETE a la API de Flask
      this.http.delete(`http://127.0.0.1:5000/api/admin/usuarios/eliminar/${id}`)
        .subscribe({
          next: () => {
            alert('Usuario eliminado correctamente');
            // Actualiza la lista en pantalla
            this.usuarios = this.usuarios.filter(u => u.id !== id);
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error al eliminar usuario:', err);
            alert(err.error?.error || 'No se pudo eliminar el usuario');
          }
        });
    }
  }
}