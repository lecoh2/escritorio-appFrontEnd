import {
  HttpClient,
  HttpHeaders,
  HttpParams
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

import {
  ApiResponse
} from '../models/respostas/api-response';

import {
  CategoriaFinanceiraRequest
} from '../models/categoria-financeira/categoria-financeira-request';

import {
  CategoriaFinanceiraUpdateRequest
} from '../models/categoria-financeira/categoria-financeira-update-request';

import {
  CategoriaFinanceiraResponse
} from '../models/categoria-financeira/categoria-financeira-response';

import {
  ObterCategoriaFinanceiraResponse
} from '../models/categoria-financeira/obter-categoria-financeira-response';
import { CategoriaFinanceiraPaginacaoResponse } from '../models/categoria-financeira/categoria-financeira-paginacao-response';


@Injectable({
  providedIn: 'root'
})
export class CategoriaFinanceiraService {

  private readonly url =
    environment.apiDeslandes;

  private readonly http =
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
            Authorization: `Bearer ${token}`
          }
        : {}
    );
  }


  // =====================================================
  // CADASTRAR
  // =====================================================

  cadastrarCategoriaFinanceira(
    request: CategoriaFinanceiraRequest
  ): Observable<ApiResponse<CategoriaFinanceiraResponse>> {

    return this.http.post<
      ApiResponse<CategoriaFinanceiraResponse>
    >(
      `${this.url}/api/v1/categoria-financeira/cadastrar-categoria-financeira`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR
  // =====================================================

  editarCategoriaFinanceira(
    id: string,
    request: CategoriaFinanceiraUpdateRequest
  ): Observable<ApiResponse<CategoriaFinanceiraResponse>> {

    return this.http.put<
      ApiResponse<CategoriaFinanceiraResponse>
    >(
      `${this.url}/api/v1/categoria-financeira/atualizar-categoria-financeira/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirCategoriaFinanceira(
    id: string
  ): Observable<ApiResponse<CategoriaFinanceiraResponse>> {

    return this.http.delete<
      ApiResponse<CategoriaFinanceiraResponse>
    >(
      `${this.url}/api/v1/categoria-financeira/remover-categoria-financeira/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PAGINADO
  // =====================================================

consultarCategoriaFinanceiraPaginado(
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

  const endpoint =
    `${this.url}/api/v1/categoria-financeira/consultar-categoria-financeira-paginacao`;

  console.log(
    'CHAMANDO ENDPOINT:',
    endpoint
  );

  console.log(
    'PARAMETROS:',
    params
  );

  return this.http.get<any>(
    endpoint,
    {
      params,
      headers: this.getHeaders()
    }
  );
}


  // =====================================================
  // OBTER POR ID
  // =====================================================

  obterCategoriaFinanceiraPorId(
    id: string
  ): Observable<ObterCategoriaFinanceiraResponse> {

    return this.http.get<
      ObterCategoriaFinanceiraResponse
    >(
      `${this.url}/api/v1/categoria-financeira/obter-categoria-financeira-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR TODOS
  // =====================================================

  consultarCategoriaFinanceira():
    Observable<CategoriaFinanceiraResponse[]> {

    return this.http.get<
      CategoriaFinanceiraResponse[]
    >(
      `${this.url}/api/v1/categoria-financeira/consultar-categoria-financeira`,
      {
        headers: this.getHeaders()
      }
    );
  }
}