import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export type Rol = 'admin' | 'profesor' | 'acudiente';

export interface Usuario {
  id: number;
  username: string;
  nombre?: string;
  rol: Rol;
}

const STORAGE_KEY = 'usuario';

/**
 * Estado de sesión compartido por toda la app.
 * Antes el menú usaba una variable local (isLoggedIn = false) que nunca se
 * actualizaba; ahora todos leen la misma señal `usuario`, así que al iniciar
 * o cerrar sesión el menú cambia al instante.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private apiUrl = '/api/auth';

  private readonly _usuario = signal<Usuario | null>(this.leerStorage());

  readonly usuario = this._usuario.asReadonly();
  readonly isLoggedIn = computed(() => this._usuario() !== null);
  readonly rol = computed(() => this._usuario()?.rol ?? null);
  readonly nombre = computed(() => {
    const u = this._usuario();
    return u ? (u.nombre || u.username) : '';
  });
  readonly iniciales = computed(() =>
    this.nombre()
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]!.toUpperCase())
      .join('')
  );

  constructor() {
    // Confirma con el servidor que la cookie de sesión sigue viva.
    if (this.isBrowser && this._usuario()) {
      this.http.get<{ user: Usuario }>(`${this.apiUrl}/me`, { withCredentials: true }).subscribe({
        next: res => this.guardar(res.user),
        error: err => { if (err.status === 401) this.guardar(null); }
      });
    }
  }

  login(credentials: { username: string; password: string }): Observable<{ user: Usuario }> {
    return this.http
      .post<{ user: Usuario }>(`${this.apiUrl}/login`, credentials, { withCredentials: true })
      .pipe(tap(res => this.guardar(res.user)));
  }

  registrar(datos: { nombre: string; username: string; password: string }): Observable<{ user: Usuario }> {
    return this.http
      .post<{ user: Usuario }>(`${this.apiUrl}/registro`, datos, { withCredentials: true })
      .pipe(tap(res => this.guardar(res.user)));
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).subscribe({ error: () => {} });
    this.guardar(null);
    this.router.navigate(['/login']);
  }

  /** Ruta de inicio según el rol del usuario. */
  rutaInicio(rol: Rol | null = this.rol()): string {
    switch (rol) {
      case 'admin': return '/admin/dashboard';
      case 'profesor': return '/profesor/dashboard';
      case 'acudiente': return '/acudiente/dashboard';
      default: return '/login';
    }
  }

  private guardar(usuario: Usuario | null): void {
    this._usuario.set(usuario);
    if (!this.isBrowser) return;
    try {
      if (usuario) localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
      else localStorage.removeItem(STORAGE_KEY);
    } catch { /* almacenamiento no disponible */ }
  }

  private leerStorage(): Usuario | null {
    if (!this.isBrowser) return null;
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  }
}
