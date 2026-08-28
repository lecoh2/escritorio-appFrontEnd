import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { PessoaFisicaRequest } from '../models/pessoa/pessoas-fisica-request';
import { PessoaJuridicaRequest } from '../models/pessoa/pessoa-juridica-request';

import { PessoaFisicaResponse } from '../models/pessoa/pessoa-fisica-response';
import { PessoaJuridicaResponse } from '../models/pessoa/pessoa-jurisica-response';

import { PessoaResumo } from '../models/pessoa/pessoa-resumo';

import { ApiResponse } from '../models/respostas/api-response';

import { PessoaFisicaUpdateRequest } from '../models/pessoa/pessoa-fisica-update-request';
import { PessoaJuridicaUpdateRequest } from '../models/pessoa/pessoa-juridica-update-request';

@Injectable({
  providedIn: 'root'
})
export class PessoaService {

  // =====================================================
  // ATRIBUTOS
  // =====================================================

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
  // CADASTRAR PESSOA FÍSICA
  // =====================================================

  cadastrarPessoaFisica(
    request: PessoaFisicaRequest
  ): Observable<
    ApiResponse<PessoaFisicaResponse>
  > {

    return this.http.post<
      ApiResponse<PessoaFisicaResponse>
    >(
      `${this.url}/api/v1/pessoa-fisica/cadastrar-pessoa-fisica`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PESSOA FÍSICA POR ID
  // =====================================================

  consultarPessoaFisicaPorId(
    id: string
  ): Observable<
    ApiResponse<PessoaFisicaResponse>
  > {

    return this.http.get<
      ApiResponse<PessoaFisicaResponse>
    >(
      `${this.url}/api/v1/pessoa-fisica/consultar-pessoa-fisica/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR PESSOA FÍSICA
  // =====================================================

  editarPessoaFisica(
    id: string,
    request: PessoaFisicaUpdateRequest
  ): Observable<
    ApiResponse<PessoaFisicaResponse>
  > {

    return this.http.put<
      ApiResponse<PessoaFisicaResponse>
    >(
      `${this.url}/api/v1/pessoa-fisica/atualizar-pessoa-fisica/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PESSOA JURÍDICA POR ID
  // =====================================================

  consultarPessoaJuridicaPorId(
    id: string
  ): Observable<
    ApiResponse<PessoaJuridicaResponse>
  > {

    return this.http.get<
      ApiResponse<PessoaJuridicaResponse>
    >(
      `${this.url}/api/v1/pessoa-juridica/consultar-pessoa-juridica/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR RESUMO / AUTOCOMPLETE
  // =====================================================

  consultarPessoasResumo(
    termo?: string,
    limite: number = 50
  ): Observable<PessoaResumo[]> {

    const params: any = {
      limite: limite.toString()
    };

    if (termo) {
      params.termo = termo;
    }

    return this.http.get<PessoaResumo[]>(
      `${this.url}/api/v1/pessoas/resumo`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CADASTRAR PESSOA JURÍDICA
  // =====================================================

  cadastrarPessoaJuridica(
    request: PessoaJuridicaRequest
  ): Observable<
    ApiResponse<PessoaJuridicaResponse>
  > {

    return this.http.post<
      ApiResponse<PessoaJuridicaResponse>
    >(
      `${this.url}/api/v1/pessoa-juridica/cadastrar-pessoa-juridica`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PESSOA FÍSICA PAGINADO
  // =====================================================

  consultarPessoaFisicaPaginado(
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
      `${this.url}/api/v1/pessoa-fisica/consultar-pessoa-fisica-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CONSULTAR PESSOA JURÍDICA PAGINADO
  // =====================================================

  consultarPessoaJuridicaPaginado(
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
      `${this.url}/api/v1/pessoa-juridica/consultar-pessoa-juridica-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // EDITAR PESSOA JURÍDICA
  // =====================================================

  editarPessoaJuridica(
    id: string,
    request: PessoaJuridicaUpdateRequest
  ): Observable<
    ApiResponse<PessoaJuridicaResponse>
  > {

    return this.http.put<
      ApiResponse<PessoaJuridicaResponse>
    >(
      `${this.url}/api/v1/pessoa-juridica/atualizar-pessoa-juridica/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }
}