import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { ConsultarEtiquetaResponse } from '../models/etiqueta/consultar-etiqueta-response';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaService {

  private url = environment.apiDeslandes;
  private http = inject(HttpClient);


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // CONSULTAR ETIQUETAS
  // =====================================================

  consultar(): Observable<ConsultarEtiquetaResponse[]> {

    return this.http.get<ConsultarEtiquetaResponse[]>(
      `${this.url}/api/v1/etiquetas/consultar-etiquetas`,
      {
        headers: this.getHeaders()
      }
    );
  }
}