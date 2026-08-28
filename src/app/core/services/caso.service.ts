import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { AtendimentoAutoComplete } from '../models/atendimento/atendimento-auto-complete';
import { CriarCasoRequest } from '../models/caso/cadastrar-caso-request';
import { CriarCasoResponse } from '../models/caso/cadastrar-caso-response';
import { ApiResponse } from '../models/respostas/api-response';
import { ObterCasoResponse } from '../models/caso/obter-caso-response ';

@Injectable({
  providedIn: 'root'
})
export class CasoService {

  private url = environment.apiDeslandes;
  private http = inject(HttpClient);

  // =====================================================
  // HEADERS
  // =====================================================

  private getHeaders(): HttpHeaders {

    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // =====================================================
  // CADASTRAR CASO
  // =====================================================

  cadastrarCaso(
    request: CriarCasoRequest
  ): Observable<ApiResponse<CriarCasoResponse>> {

    return this.http.post<ApiResponse<CriarCasoResponse>>(
      `${this.url}/api/v1/caso/cadastrar-caso`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =====================================================
  // AUTOCOMPLETE CASO
  // =====================================================

  consultarCasoAutoComplete(
    termo?: string,
    limite: number = 50
  ): Observable<AtendimentoAutoComplete[]> {

    const params: any = {
      limite: limite.toString()
    };

    if (termo) {
      params.termo = termo;
    }

    return this.http.get<AtendimentoAutoComplete[]>(
      `${this.url}/api/v1/caso/consultar-caso-autocomplete`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }

  // =====================================================
  // CONSULTAR CASO PAGINADO
  // =====================================================

  consultarCasoPaginado(
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
      `${this.url}/api/v1/caso/consultar-caso-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }

  // =====================================================
  // OBTER CASO POR ID
  // =====================================================

  ObterCasoPorId(
    id: string
  ): Observable<ObterCasoResponse> {

    return this.http.get<ObterCasoResponse>(
      `${this.url}/api/v1/caso/obter-caso-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }

  // =====================================================
  // ATUALIZAR CASO
  // =====================================================

  atualizarCaso(
    id: string,
    request: any
  ): Observable<any> {

    return this.http.put<any>(
      `${this.url}/api/v1/caso/atualizar-caso/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }
}