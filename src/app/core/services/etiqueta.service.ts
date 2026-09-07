import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';

import { ConsultarEtiquetaResponse } from '../models/etiqueta/consultar-etiqueta-response';

import { EtiquetaUpdateRequest } from '../models/etiqueta/etiqueta-update-request';
import { EtiquetaRequest } from '../models/etiqueta/etiqueta-resquest';

@Injectable({
  providedIn: 'root'
})
export class EtiquetaService {

  // =========================
  // ATRIBUTOS
  // =========================

  private url = environment.apiDeslandes;

  private http = inject(HttpClient);


  // =========================
  // CADASTRAR
  // =========================

  cadastrarEtiqueta(
    request: EtiquetaRequest
  ): Observable<ApiResponse<ConsultarEtiquetaResponse>> {

    const token =
      localStorage.getItem('token');

    return this.http.post<
      ApiResponse<ConsultarEtiquetaResponse>
    >(
      `${this.url}/api/v1/etiquetas/cadastrar-etiqueta`,
      request,
      {
        headers: token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : {}
      }
    );
  }


  // =========================
  // CONSULTAR TODAS
  // =========================

  consultar():
    Observable<ConsultarEtiquetaResponse[]> {

    return this.http.get<
      ConsultarEtiquetaResponse[]
    >(
      `${this.url}/api/v1/etiquetas/consultar-etiquetas`
    );
  }


  // =========================
  // CONSULTAR PAGINAÇÃO
  // =========================

  consultarEtiquetaPaginado(
    pageNumber: number,
    pageSize: number,
    searchTerm?: string
  ): Observable<any> {

    const params: any = {

      pageNumber:
        pageNumber.toString(),

      pageSize:
        pageSize.toString()

    };

    if (searchTerm) {

      params.searchTerm =
        searchTerm;

    }

    return this.http.get<any>(
      `${this.url}/api/v1/etiquetas/consultar-etiquetas-paginacao`,
      {
        params
      }
    );
  }


  // =========================
  // OBTER POR ID
  // =========================

  obterEtiquetaPorId(
    id: string
  ): Observable<ConsultarEtiquetaResponse> {

    return this.http.get<
      ConsultarEtiquetaResponse
    >(
      `${this.url}/api/v1/etiquetas/obter-etiqueta-por-id/${id}`
    );
  }


  // =========================
  // ATUALIZAR
  // =========================

  atualizarEtiqueta(
    id: string,
    request: EtiquetaUpdateRequest
  ): Observable<ApiResponse<ConsultarEtiquetaResponse>> {

    const token =
      localStorage.getItem('token');

    return this.http.put<
      ApiResponse<ConsultarEtiquetaResponse>
    >(
      `${this.url}/api/v1/etiquetas/atualizar-etiqueta/${id}`,
      request,
      {
        headers: token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : {}
      }
    );
  }


  // =========================
  // EXCLUIR
  // =========================

  excluirEtiqueta(
    id: string
  ): Observable<ApiResponse<ConsultarEtiquetaResponse>> {

    const token =
      localStorage.getItem('token');

    return this.http.delete<
      ApiResponse<ConsultarEtiquetaResponse>
    >(
      `${this.url}/api/v1/etiquetas/excluir-etiqueta/${id}`,
      {
        headers: token
          ? {
              Authorization:
                `Bearer ${token}`
            }
          : {}
      }
    );
  }
}