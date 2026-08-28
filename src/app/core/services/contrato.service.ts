import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';

import { ContratoRequest } from '../models/contrato/contrato-request';
import { ContratoResponse } from '../models/contrato/contrato-response';

@Injectable({
  providedIn: 'root'
})
export class ContratoService {

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

  cadastrarContrato(
    request: ContratoRequest
  ): Observable<ApiResponse<ContratoResponse>> {

    return this.http.post<ApiResponse<ContratoResponse>>(
      `${this.url}/api/v1/contrato/cadastrar-contrato`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PAGINADO
  // =====================================================

  consultarContratosPaginado(
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
      `${this.url}/api/v1/contrato/consultar-contato-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR TODOS
  // =====================================================

  consultarContratos(): Observable<ContratoResponse[]> {

    return this.http.get<ContratoResponse[]>(
      `${this.url}/api/v1/contrato/consultar-contratos`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // OBTER POR ID
  // =====================================================

  obterContratoPorId(
    id: string
  ): Observable<ContratoResponse> {

    return this.http.get<ContratoResponse>(
      `${this.url}/api/v1/contrato/obter-contrato-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

  editarContrato(
    id: string,
    request: ContratoRequest
  ): Observable<any> {

    return this.http.put<any>(
      `${this.url}/api/v1/contrato/atualizar-contrato/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirContrato(
    id: string
  ): Observable<any> {

    return this.http.delete<any>(
      `${this.url}/api/v1/contrato/excluir-contrato/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  consultarContratosDisponiveisContaPagar():
  Observable<ContratoResponse[]> {

  return this.http.get<
    ContratoResponse[]
  >(
    `${this.url}/api/v1/contrato/consultar-contratos-disponiveis-conta-pagar`,
    {
      headers: this.getHeaders()
    }
  );
}
consultarContratosDisponiveisContaReceber():
  Observable<ContratoResponse[]> {

  return this.http.get<
    ContratoResponse[]
  >(
    `${this.url}/api/v1/contrato/consultar-contratos-disponiveis-conta-receber`,
    {
      headers: this.getHeaders()
    }
  );
}
}