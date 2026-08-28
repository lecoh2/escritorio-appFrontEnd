import {
  HttpClient,
  HttpHeaders
} from '@angular/common/http';

import {
  inject,
  Injectable
} from '@angular/core';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { ApiResponse } from '../models/respostas/api-response';

import { LicencaRequest } from '../models/licenca/licenca-request';
import { LicencaUpdateRequest } from '../models/licenca/licenca-update-request';
import { LicencaResponse } from '../models/licenca/licenca-response';

import { AtivarLicencaRequest } from '../models/licenca/ativar-licenca-request';
import { RenovarLicencaRequest } from '../models/licenca/renovar-licenca-request';
import { ValidarLicencaResponse } from '../models/licenca/validar-licenca-response';


@Injectable({
  providedIn: 'root'
})
export class LicencaService {

  // =========================
  // ATRIBUTOS
  // =========================

  private url =
    environment.apiDeslandes;

  private http =
    inject(HttpClient);


  // =========================
  // HEADERS
  // =========================

  private getHeaders(): HttpHeaders {

    const token =
      localStorage.getItem('token');

    return new HttpHeaders(
      token
        ? {
            Authorization:
              `Bearer ${token}`
          }
        : {}
    );
  }


  // =========================
  // CADASTRAR
  // =========================

  cadastrarLicenca(
    request: LicencaRequest
  ): Observable<
    ApiResponse<LicencaResponse>
  > {

    return this.http.post<
      ApiResponse<LicencaResponse>
    >(
      `${this.url}/api/v1/licenca/cadastrar-licenca`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR PAGINADO
  // =========================

  consultarLicencasPaginacao(
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
      `${this.url}/api/v1/licenca/consultar-licenca-paginacao`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR TODAS
  // =========================

  consultarLicencas():
    Observable<LicencaResponse[]> {

    return this.http.get<
      LicencaResponse[]
    >(
      `${this.url}/api/v1/licenca/consultar-licencas`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CONSULTAR POR ID
  // =========================

  consultarLicencaPorId(
    id: string
  ): Observable<LicencaResponse> {

    return this.http.get<
      LicencaResponse
    >(
      `${this.url}/api/v1/licenca/obter-licenca-por-id/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // LICENÇA ATUAL DO ESCRITÓRIO
  // =========================

  consultarLicencaAtualEscritorio(
    escritorioId: string
  ): Observable<LicencaResponse> {

    return this.http.get<
      LicencaResponse
    >(
      `${this.url}/api/v1/licenca/consultar-licenca-atual-escritorio/${escritorioId}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // HISTÓRICO POR ESCRITÓRIO
  // =========================

  consultarLicencasPorEscritorio(
    escritorioId: string
  ): Observable<LicencaResponse[]> {

    return this.http.get<
      LicencaResponse[]
    >(
      `${this.url}/api/v1/licenca/consultar-licencas-por-escritorio/${escritorioId}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // ATUALIZAR
  // =========================

  editarLicencaPorId(
    id: string,
    request: LicencaUpdateRequest
  ): Observable<
    ApiResponse<LicencaResponse>
  > {

    return this.http.put<
      ApiResponse<LicencaResponse>
    >(
      `${this.url}/api/v1/licenca/atualizar-licenca/${id}`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // ATIVAR
  // =========================

  ativarLicenca(
    request: AtivarLicencaRequest
  ): Observable<
    ApiResponse<LicencaResponse>
  > {

    return this.http.post<
      ApiResponse<LicencaResponse>
    >(
      `${this.url}/api/v1/licenca/ativar-licenca`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // RENOVAR
  // =========================

  renovarLicenca(
    request: RenovarLicencaRequest
  ): Observable<
    ApiResponse<LicencaResponse>
  > {

    return this.http.patch<
      ApiResponse<LicencaResponse>
    >(
      `${this.url}/api/v1/licenca/renovar-licenca`,
      request,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // SUSPENDER
  // =========================

  suspenderLicencaPorId(
    id: string
  ): Observable<
    ApiResponse<void>
  > {

    return this.http.patch<
      ApiResponse<void>
    >(
      `${this.url}/api/v1/licenca/suspender-licenca/${id}`,
      null,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // CANCELAR
  // =========================

  cancelarLicencaPorId(
    id: string
  ): Observable<
    ApiResponse<void>
  > {

    return this.http.patch<
      ApiResponse<void>
    >(
      `${this.url}/api/v1/licenca/cancelar-licenca/${id}`,
      null,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // VALIDAR
  // =========================

  validarLicencaPorEscritorio(
    escritorioId: string
  ): Observable<
    ValidarLicencaResponse
  > {

    return this.http.get<
      ValidarLicencaResponse
    >(
      `${this.url}/api/v1/licenca/validar-licenca/${escritorioId}`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =========================
  // EXCLUIR
  // =========================

  excluirLicenca(
    id: string
  ): Observable<
    ApiResponse<LicencaResponse>
  > {

    return this.http.delete<
      ApiResponse<LicencaResponse>
    >(
      `${this.url}/api/v1/licenca/excluir-licenca/${id}`,
      {
        headers: this.getHeaders()
      }
    );
  }
}