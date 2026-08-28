import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';
import { ContaReceberRequest } from '../models/contas/conta-receber-request';
import { ContaReceberResponse } from '../models/contas/conta-receber.response';
import { ContaReceberBaixaRequest } from '../models/contas/conta-receber-baixa-request';
import { ContaReceberUpdateRequest } from '../models/contas/conta-receber-update-request';

@Injectable({
  providedIn: 'root'
})
export class ContaReceberService {

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

  cadastrarContaReceber(
    request: ContaReceberRequest
  ): Observable<ApiResponse<ContaReceberResponse>> {

    return this.http.post<ApiResponse<ContaReceberResponse>>(
      `${this.url}/api/v1/conta-receber/cadastrar-conta-receber`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

editarContaReceber(
  id: string,
  request: ContaReceberUpdateRequest
): Observable<ApiResponse<ContaReceberResponse>> {

  return this.http.put<ApiResponse<ContaReceberResponse>>(
    `${this.url}/api/v1/conta-receber/atualizar-conta-receber/${id}`,
    request,
    {
      headers: this.getHeaders()
    }
  );
}

  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirContaReceber(
    id: string
  ): Observable<ApiResponse<ContaReceberResponse>> {

    return this.http.delete<ApiResponse<ContaReceberResponse>>(
      `${this.url}/api/v1/conta-receber/excluir-conta-receber/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR TODAS
  // =====================================================

  consultarContasReceber(): Observable<ContaReceberResponse[]> {

    return this.http.get<ContaReceberResponse[]>(
      `${this.url}/api/v1/conta-receber/consultar-contas-receber`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PAGINADO
  // =====================================================

  consultarContasReceberPaginado(
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
      `${this.url}/api/v1/conta-receber/consultar-conta-receber-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // BAIXAR CONTA
  // =====================================================

  baixarContaReceber(
    id: string,
    request: ContaReceberBaixaRequest
  ): Observable<any> {

    return this.http.post<any>(
      `${this.url}/api/v1/conta-receber/baixar-conta-receber/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR AGRUPADO
  // =====================================================

  consultarContasReceberAgrupado(): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.url}/api/v1/conta-receber/conta-receber-agrupado`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // OBTER POR ID
  // =====================================================

  obterContaReceberPorId(
    id: string
  ): Observable<ContaReceberResponse> {

    return this.http.get<ContaReceberResponse>(
      `${this.url}/api/v1/conta-receber/obter-conta-receber-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}