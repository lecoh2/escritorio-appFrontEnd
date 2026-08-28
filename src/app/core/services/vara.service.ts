import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ConsultarVaraResponse } from '../models/vara/consultar-vara-response';

@Injectable({
  providedIn: 'root'
})
export class VaraService {

  private url = environment.apiDeslandes;
  private http = inject(HttpClient);


  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization: `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // CONSULTAR VARAS
  // =====================================================

  consultar(): Observable<ConsultarVaraResponse[]> {

    return this.http.get<ConsultarVaraResponse[]>(
      `${this.url}/api/v1/vara/consultar-vara`,
      {
        headers: this.getHeaders()
      }
    );
  }
}