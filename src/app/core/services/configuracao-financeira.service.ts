import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ConfiguracaoFinanceiraRequest } from '../models/configuracao-financeira/configuracao-financeira-request';
import { ConfiguracaoFinanceiraResponse } from '../models/configuracao-financeira/configuracao-financeira-response';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoFinanceiraService {

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
  // OBTER CONFIGURAÇÃO
  // =====================================================

  obterConfiguracao(): Observable<ConfiguracaoFinanceiraResponse> {

    return this.http.get<ConfiguracaoFinanceiraResponse>(
      `${this.url}/api/v1/configuracao-financeira/obter`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // SALVAR CONFIGURAÇÃO
  // =====================================================

  salvarConfiguracao(
    request: ConfiguracaoFinanceiraRequest
  ): Observable<ConfiguracaoFinanceiraResponse> {

    return this.http.post<ConfiguracaoFinanceiraResponse>(
      `${this.url}/api/v1/configuracao-financeira/salvar`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // USAR CONFIGURAÇÃO AUTOMÁTICA
  // =====================================================

// =====================================================
// USAR META AUTOMÁTICA
// =====================================================

usarAutomatica(): Observable<any> {

  return this.http.post<any>(
    `${this.url}/api/v1/configuracao-financeira/usar-automatica`,
    {},
    {
      headers: this.getHeaders()
    }
  );

}
}