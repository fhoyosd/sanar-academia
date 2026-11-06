import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AcudienteService {
  private http = inject(HttpClient);
  private readonly apiUrl = 'http://127.0.0.1:5000/api/acudiente';

  obtenerDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { withCredentials: true });
  }

  obtenerEstudiante(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estudiantes/${id}`, { withCredentials: true });
  }
}
