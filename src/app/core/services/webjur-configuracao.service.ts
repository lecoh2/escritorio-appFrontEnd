import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import {
  Observable
} from 'rxjs';

import {
  environment
} from '../../../environments/environment.development';
import { WebJurConfiguracaoRequest } from '../models/webjur/webJur-configuracao-request';
import { WebJurConfiguracaoResponse } from '../models/webjur/webJur-configuracao-response';
import { WebJurConfiguracaoEditarRequest } from '../models/webjur/webJur-configuracao-editar-request';

@Injectable({
  providedIn: 'root'
})
export class WebJurConfiguracaoService {

  private url =
    environment.apiDeslandes;

  private http =
    inject(HttpClient);

  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {}
    );
  }

  // =====================================================
  // CADASTRAR CONFIGURAÇÃO
  // =====================================================

  cadastrar(
    request: WebJurConfiguracaoRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/webjur/configuracao`,
      request,
      {
        headers:
          this.getHeaders()
      }
    );
  }

  // =====================================================
  // OBTER CONFIGURAÇÃO ATIVA DO ESCRITÓRIO
  // =====================================================

  obter(): Observable<WebJurConfiguracaoResponse> {

    return this.http.get<WebJurConfiguracaoResponse>(
      `${this.url}/api/v1/webjur/configuracao`,
      {
        headers:
          this.getHeaders()
      }
    );
  }

  // =====================================================
  // EDITAR CONFIGURAÇÃO
  // =====================================================

  editar(
    id: string,
    request: WebJurConfiguracaoEditarRequest
  ): Observable<any> {

    return this.http.put<any>(
      `${this.url}/api/v1/webjur/configuracao/${id}`,
      request,
      {
        headers:
          this.getHeaders()
      }
    );
  }

  // =====================================================
  // ATIVAR CONFIGURAÇÃO
  // =====================================================

  ativar(
    id: string
  ): Observable<any> {

    return this.http.patch<any>(
      `${this.url}/api/v1/webjur/configuracao/${id}/ativar`,
      {},
      {
        headers:
          this.getHeaders()
      }
    );
  }

  // =====================================================
  // DESATIVAR CONFIGURAÇÃO
  // =====================================================

  desativar(
    id: string
  ): Observable<any> {

    return this.http.patch<any>(
      `${this.url}/api/v1/webjur/configuracao/${id}/desativar`,
      {},
      {
        headers:
          this.getHeaders()
      }
    );
  }
}