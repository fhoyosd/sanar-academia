import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

interface Categoria { id: number; nombre: string; profesor_id: number | null; profesor: string | null; jugadores: number; }

/** HU010 – Asignación de entrenadores a categorías o grupos. */
@Component({
  selector: 'app-categorias',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './categorias.html'
})
export class CategoriasComponent {
  private http = inject(HttpClient);

  categorias = signal<Categoria[]>([]);
  profesores = signal<{ id: number; nombre_completo: string }[]>([]);
  cargando = signal(true);
  mensaje = signal('');
  error = signal('');

  constructor() {
    this.http.get<any[]>('/api/admin/profesores').subscribe({ next: p => this.profesores.set(p) });
    this.cargar();
  }

  cargar(): void {
    this.http.get<Categoria[]>('/api/admin/categorias').subscribe({
      next: c => { this.categorias.set(c); this.cargando.set(false); },
      error: () => { this.error.set('No se pudieron cargar las categorías.'); this.cargando.set(false); }
    });
  }

  asignar(cat: Categoria, profesorId: string): void {
    this.mensaje.set('');
    this.error.set('');
    this.http.put(`/api/admin/categorias/${cat.id}`, { profesor_id: profesorId ? Number(profesorId) : null }).subscribe({
      next: () => {
        const prof = this.profesores().find(p => p.id === Number(profesorId));
        this.categorias.update(l => l.map(c => c.id === cat.id
          ? { ...c, profesor_id: prof?.id ?? null, profesor: prof?.nombre_completo ?? null } : c));
        this.mensaje.set(`Entrenador de «${cat.nombre}» actualizado.`);
      },
      error: () => this.error.set('No se pudo asignar el entrenador.')
    });
  }

  eliminar(cat: Categoria): void {
    if (!confirm(`¿Eliminar la categoría «${cat.nombre}»? Sus jugadores quedarán sin categoría.`)) return;
    this.http.delete(`/api/admin/categorias/${cat.id}`).subscribe({
      next: () => this.categorias.update(l => l.filter(c => c.id !== cat.id)),
      error: () => this.error.set('No se pudo eliminar la categoría.')
    });
  }
}
