import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';
import { CentroCustoRequest } from '../models/centro-custo/centro-custo-requeste';
import { CentroCustoResponse } from '../models/centro-custo/centro-custo-response';
import { CentroCustoUpdateRequest } from '../models/centro-custo/centro-custo-update-request';

@Injectable({
  providedIn: 'root'
})
export class CentroCustoService {

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
  // CADASTRAR
  // =====================================================

  cadastrarCentroCusto(
    request: CentroCustoRequest
  ): Observable<ApiResponse<CentroCustoResponse>> {

    return this.http.post<ApiResponse<CentroCustoResponse>>(
      `${this.url}/api/v1/centro-custo/cadastrar-centro-custo`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // OBTER POR ID
  // =====================================================

  obterCentroCustoPorId(
    id: string
  ): Observable<CentroCustoResponse> {

    return this.http.get<CentroCustoResponse>(
      `${this.url}/api/v1/centro-custo/obter-centro-custo-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ATUALIZAR
  // =====================================================

  atualizarCentroCusto(
    id: string,
    request: CentroCustoRequest
  ): Observable<ApiResponse<CentroCustoResponse>> {

    return this.http.put<ApiResponse<CentroCustoResponse>>(
      `${this.url}/api/v1/centro-custo/atualizar-centro-custo/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

editarCentroCusto(
  id: string,
  request: CentroCustoUpdateRequest
): Observable<ApiResponse<CentroCustoResponse>> {

  return this.http.put<ApiResponse<CentroCustoResponse>>(
    `${this.url}/api/v1/centro-custo/atualizar-centro-custo/${id}`,
    request,
    {
      headers: this.getHeaders()
    }
  );
}


  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirCentroCusto(
    id: string
  ): Observable<ApiResponse<CentroCustoResponse>> {

    return this.http.delete<ApiResponse<CentroCustoResponse>>(
      `${this.url}/api/v1/centro-custo/remover-centro-custo/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR TODOS
  // =====================================================

  consultarCentroCusto(): Observable<CentroCustoResponse[]> {

    return this.http.get<CentroCustoResponse[]>(
      `${this.url}/api/v1/centro-custo/consultar-centro-custo`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PAGINADO
  // =====================================================

  consultarCentroCustoPaginado(
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
      `${this.url}/api/v1/centro-custo/consultar-centro-custo-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }
}