import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';
import { ContaPagarRequest } from '../models/contas/conta-pagar-request';
import { ContaPagarResponse } from '../models/contas/conta-pagar.response';
import { ContaPagarUpdateRequest } from '../models/contas/conta-pagar-update-request';

@Injectable({
  providedIn: 'root'
})
export class ContaPagarService {

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

  cadastrarContaPagar(
    request: ContaPagarRequest
  ): Observable<ApiResponse<ContaPagarResponse>> {

    return this.http.post<ApiResponse<ContaPagarResponse>>(
      `${this.url}/api/v1/conta-pagar/cadastrar-conta-pagar`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

editarContaPagar(
  id: string,
  request: ContaPagarUpdateRequest
): Observable<ApiResponse<ContaPagarResponse>> {

  return this.http.put<ApiResponse<ContaPagarResponse>>(
    `${this.url}/api/v1/conta-pagar/atualizar-conta-pagar/${id}`,
    request,
    {
      headers: this.getHeaders()
    }
  );
}
  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirContaPagar(
    id: string
  ): Observable<ApiResponse<ContaPagarResponse>> {

    return this.http.delete<ApiResponse<ContaPagarResponse>>(
      `${this.url}/api/v1/conta-pagar/excluir-conta-pagar/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR TODAS
  // =====================================================

  consultarContasPagar(): Observable<ContaPagarResponse[]> {

    return this.http.get<ContaPagarResponse[]>(
      `${this.url}/api/v1/conta-pagar/consultar-contas-pagar`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PAGINADO
  // =====================================================

  consultarContasPagarPaginado(
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
      `${this.url}/api/v1/conta-pagar/consultar-conta-pagar-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // BAIXAR CONTA
  // =====================================================

  baixarContaPagar(
    id: string,
    request: any
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/conta-pagar/baixar-conta-pagar/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // OBTER POR ID
  // =====================================================

  obterContaPagarPorId(
    id: string
  ): Observable<ContaPagarResponse> {

    return this.http.get<ContaPagarResponse>(
      `${this.url}/api/v1/conta-pagar/obter-conta-pagar-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}