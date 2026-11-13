import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AcudienteService {
  private http = inject(HttpClient);
  private readonly apiUrl = '/api/acudiente';

  obtenerDashboard(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dashboard`, { withCredentials: true });
  }

  reportarPago(datos: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/pagos/reportar`, datos, { withCredentials: true });
  }

  obtenerEstudiante(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/estudiantes/${id}`, { withCredentials: true });
  }
}
