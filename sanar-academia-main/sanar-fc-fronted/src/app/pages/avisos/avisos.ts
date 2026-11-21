import { Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';

interface Aviso {
  id: number; titulo: string; mensaje: string; fecha: string;
  categoria_id: number | null; categoria: string; creador: string; creador_id: number;
}

/**
 * HU012 / HU022 – Publicación de información y avisos institucionales (admin).
 * HU023 – Envío de notificaciones dirigidas a un grupo (entrenador).
 */
@Component({
  selector: 'app-avisos',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './avisos.html',
  styleUrl: './avisos.css'
})
export class AvisosComponent {
  private http = inject(HttpClient);
  readonly auth = inject(AuthService);

  readonly esAdmin = computed(() => this.auth.rol() === 'admin');
  avisos = signal<Aviso[]>([]);
  categorias = signal<{ id: number; nombre: string }[]>([]);
  cargando = signal(true);
  enviando = signal(false);
  exito = signal('');
  error = signal('');

  form = { titulo: '', mensaje: '', categoria_id: '' as string | number };

  constructor() {
    const urlCategorias = this.esAdmin() ? '/api/admin/categorias' : '/api/profesor/categorias';
    this.http.get<any[]>(urlCategorias, { withCredentials: true }).subscribe({
      next: c => {
        this.categorias.set(c);
        if (!this.esAdmin() && c.length) this.form.categoria_id = c[0].id;
      }
    });
    this.cargar();
  }

  cargar(): void {
    this.http.get<Aviso[]>('/api/avisos', { withCredentials: true }).subscribe({
      next: a => { this.avisos.set(a); this.cargando.set(false); },
      error: err => {
        this.cargando.set(false);
        this.error.set(err.status === 401 ? 'Tu sesión expiró, vuelve a iniciar sesión.' : 'No se pudieron cargar los avisos.');
      }
    });
  }

  publicar(): void {
    this.exito.set('');
    this.error.set('');
    if (!this.form.titulo.trim() || !this.form.mensaje.trim()) {
      this.error.set('El título y el mensaje son obligatorios.');
      return;
    }
    this.enviando.set(true);
    const body = { ...this.form, categoria_id: this.form.categoria_id ? Number(this.form.categoria_id) : null };
    this.http.post<{ aviso: Aviso }>('/api/avisos', body, { withCredentials: true }).subscribe({
      next: res => {
        this.enviando.set(false);
        this.avisos.update(l => [res.aviso, ...l]);
        this.exito.set(this.esAdmin() ? 'Aviso publicado correctamente.' : 'Notificación enviada al grupo.');
        this.form.titulo = '';
        this.form.mensaje = '';
      },
      error: err => {
        this.enviando.set(false);
        this.error.set(err.error?.error || 'No se pudo publicar.');
      }
    });
  }

  eliminar(a: Aviso): void {
    if (!confirm(`¿Eliminar el aviso «${a.titulo}»?`)) return;
    this.http.delete(`/api/avisos/${a.id}`, { withCredentials: true }).subscribe({
      next: () => this.avisos.update(l => l.filter(x => x.id !== a.id)),
      error: err => this.error.set(err.error?.error || 'No se pudo eliminar.')
    });
  }

  puedeEliminar(a: Aviso): boolean {
    return this.esAdmin() || a.creador_id === this.auth.usuario()?.id;
  }
}
