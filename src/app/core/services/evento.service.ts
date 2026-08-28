import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';

import { CriarEventoRequest } from '../models/evento/criar-evento-request';
import { CriarEventoResponse } from '../models/evento/criar-evento-response';
import { ObterEventoResponse } from '../models/evento/obter-evento-response ';


@Injectable({
  providedIn: 'root'
})
export class EventoService {

  // =========================
  // DEPENDÊNCIAS
  // =========================

  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  // =========================
  // HEADERS
  // =========================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // =========================
  // CADASTRAR EVENTO
  // =========================

  cadastrarEvento(
    request: CriarEventoRequest
  ): Observable<ApiResponse<CriarEventoResponse>> {

    return this.http.post<
      ApiResponse<CriarEventoResponse>
    >(
      `${this.url}/api/v1/evento/cadastrar-evento`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================
  // OBTER EVENTO POR ID
  // =========================

  ObterEventoPorId(
    id: string
  ): Observable<ObterEventoResponse> {

    return this.http.get<ObterEventoResponse>(
      `${this.url}/api/v1/evento/obter-evento-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================
  // EDITAR EVENTO
  // =========================

  editarEvento(
    id: string,
    request: any
  ): Observable<ApiResponse<CriarEventoResponse>> {

    return this.http.put<
      ApiResponse<CriarEventoResponse>
    >(
      `${this.url}/api/v1/evento/atualizar-evento/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =========================
  // CONSULTAR EVENTOS PAGINADOS
  // =========================

  consultarEventoPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    let params =
      new HttpParams()
        .set(
          'pageNumber',
          pageNumber.toString()
        )
        .set(
          'pageSize',
          pageSize.toString()
        );

    if (searchTerm?.trim()) {

      params =
        params.set(
          'searchTerm',
          searchTerm.trim()
        );
    }

    return this.http.get<any>(
      `${this.url}/api/v1/evento/consultar-evento-paginacao`,
      {
        headers: this.getHeaders(),
        params
      }
    );
  }
}