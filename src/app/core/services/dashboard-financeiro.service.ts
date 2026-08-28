import { inject, Injectable } from '@angular/core';
import {
  HttpClient,
  HttpHeaders,
  HttpParams
} from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';
import { DashboardFinanceiroResponse } from '../models/dashborad-financeiro/dashboard-financeiro-response';

@Injectable({
  providedIn: 'root'
})
export class DashboardFinanceiroService {

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
  // DASHBOARD FINANCEIRO
  // =====================================================

  getDashboardFinanceiro(
    ano?: number,
    mes?: number
  ): Observable<DashboardFinanceiroResponse> {

    const dataAtual = new Date();

    const anoFinal =
      ano ?? dataAtual.getFullYear();

    const mesFinal =
      mes ?? (dataAtual.getMonth() + 1);

    const params =
      new HttpParams()
        .set(
          'ano',
          anoFinal.toString()
        )
        .set(
          'mes',
          mesFinal.toString()
        );

    return this.http.get<DashboardFinanceiroResponse>(
      `${this.url}/api/v1/dashboard-financeiro/obter-dashboard`,
      {
        params,
        headers: this.getHeaders()
      }
    );
  }
}