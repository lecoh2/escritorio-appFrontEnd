import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { QualificacaoResponse } from '../models/qualificacao/qualificacao-response';

@Injectable({
  providedIn: 'root'
})
export class QualificacoesService {

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
  // CONSULTAR QUALIFICAÇÕES
  // =====================================================

  consultarQualificacoes():
    Observable<QualificacaoResponse[]> {

    return this.http.get<QualificacaoResponse[]>(
      `${this.url}/api/v1/qualificacao/consultar-qualidicacao`,
      {
        headers: this.getHeaders()
      }
    );
  }
}