import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';

import { EscritorioRequest } from '../models/escritorio/escritorio-request';
import { EscritorioResponse } from '../models/escritorio/escritorio-response';
import { EscritorioUpdateRequest } from '../models/escritorio/escritorioU-update-request';

@Injectable({
  providedIn: 'root'
})
export class EscritorioService {

  // =========================
  // ATRIBUTOS
  // =========================

  private url = environment.apiDeslandes;
  private http = inject(HttpClient);


  // =========================
  // HEADERS
  // =========================

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


  // =========================
  // CADASTRAR
  // =========================

  cadastrarEscritorio(
    request: EscritorioRequest
  ): Observable<ApiResponse<EscritorioResponse>> {

    return this.http.post<ApiResponse<EscritorioResponse>>(
      `${this.url}/api/v1/escritorio/cadastrar-escritorio`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR PAGINADO
  // =========================

  consultarEscritoriosPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    const params: any = {
      pageNumber: pageNumber.toString(),
      pageSize: pageSize.toString()
    };

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    return this.http.get<any>(
      `${this.url}/api/v1/escritorio/consultar-escritorio-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // BUSCAR POR NOME
  // =========================

  buscarPorNome(
    nome: string
  ): Observable<EscritorioResponse[]> {

    return this
      .consultarEscritoriosPaginado(
        1,
        10,
        nome
      )
      .pipe(
        map((response: any) =>
          response.items || []
        )
      );
  }


  // =========================
  // CONSULTAR TODOS
  // =========================

  consultarEscritorios():
    Observable<EscritorioResponse[]> {

    return this.http.get<EscritorioResponse[]>(
      `${this.url}/api/v1/escritorio/consultar-escritorios`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR POR ID
  // =========================

  consultarEscritorioPorId(
    id: string
  ): Observable<EscritorioResponse> {

    return this.http.get<EscritorioResponse>(
      `${this.url}/api/v1/escritorio/obter-escritorio-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR COMPLETO POR ID
  // =========================

  consultarEscritorioCompletoPorId(
    id: string
  ): Observable<EscritorioResponse> {

    return this.http.get<EscritorioResponse>(
      `${this.url}/api/v1/escritorio/obter-escritorio-completo-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR POR DOCUMENTO
  // =========================

  consultarEscritorioPorDocumento(
    documento: string
  ): Observable<EscritorioResponse> {

    const params: any = {
      documento
    };

    return this.http.get<EscritorioResponse>(
      `${this.url}/api/v1/escritorio/obter-escritorio-por-documento`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // ATUALIZAR
  // =========================

  editarEscritorioPorId(
    id: string,
    request: EscritorioUpdateRequest
  ): Observable<ApiResponse<EscritorioResponse>> {

    return this.http.put<ApiResponse<EscritorioResponse>>(
      `${this.url}/api/v1/escritorio/atualizar-escritorio/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // EXCLUIR
  // =========================

  excluirEscritorio(
    id: string
  ): Observable<ApiResponse<EscritorioResponse>> {

    return this.http.delete<ApiResponse<EscritorioResponse>>(
      `${this.url}/api/v1/escritorio/excluir-escritorio/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}