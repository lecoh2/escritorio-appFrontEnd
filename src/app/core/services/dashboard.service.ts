import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment.development';

import { AtendimentoAgrupadoResponse } from '../models/atendimento/atendimento-agrupodo-response';
import { ProcessoAgrupadoResponse } from '../models/processo/proceso-agrupado-response';
import { CasoAgrupadoResponse } from '../models/caso/caso-agrupado-response';
import { LembreteResponse } from '../models/lembrete/lembrete-response';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

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
  // ÚLTIMOS ATENDIMENTOS
  // =====================================================

  getUltimosAtendimentos(
    qtd: number = 5
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.url}/api/v1/atendimento/ultimos-atendimentos`,
      {
        params: {
          quantidade: qtd.toString()
        },
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ÚLTIMOS PROCESSOS
  // =====================================================

  getUltimosProcessos(
    qtd: number = 5
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.url}/api/v1/processo/ultimos-processos`,
      {
        params: {
          quantidade: qtd.toString()
        },
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // PROCESSOS - ANO ATUAL
  // =====================================================

  getUltimosProcessosAnoAtual(): Observable<number> {

    return this.http.get<number>(
      `${this.url}/api/v1/processo/contar-processo-anoatual`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // PROCESSOS - TOTAL
  // =====================================================

  getTotalProcessos(): Observable<number> {

    return this.http.get<number>(
      `${this.url}/api/v1/processo/contar-processos-total`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ATENDIMENTOS - ANO ATUAL
  // =====================================================

  getUltimosAtendimentoAnoAtual(): Observable<number> {

    return this.http.get<number>(
      `${this.url}/api/v1/atendimento/contar-atendimento-anoatual`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ATENDIMENTOS - TOTAL
  // =====================================================

  getTotalAtendimento(): Observable<number> {

    return this.http.get<number>(
      `${this.url}/api/v1/atendimento/contar-atendimento-total`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CASOS - ANO ATUAL
  // =====================================================

  getUltimosCasoAnoAtual(): Observable<number> {

    return this.http.get<number>(
      `${this.url}/api/v1/caso/contar-caso-anoatual`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // CASOS - TOTAL
  // =====================================================

  getTotalCaso(): Observable<number> {

    return this.http.get<number>(
      `${this.url}/api/v1/caso/contar-caso-total`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ÚLTIMAS TAREFAS
  // =====================================================

  getUltimasTarefas(
    qtd: number = 5
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.url}/api/v1/tarefa/ultimas-tarefas`,
      {
        params: {
          quantidade: qtd.toString()
        },
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ÚLTIMOS EVENTOS
  // =====================================================

  getUltimosEventos(
    qtd: number = 5
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.url}/api/v1/evento/ultimos-eventos`,
      {
        params: {
          quantidade: qtd.toString()
        },
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // ÚLTIMOS CASOS
  // =====================================================

  getUltimosCasos(
    qtd: number = 5
  ): Observable<any[]> {

    return this.http.get<any[]>(
      `${this.url}/api/v1/caso/ultimos-casos`,
      {
        params: {
          quantidade: qtd.toString()
        },
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // GRÁFICO ATENDIMENTO
  // =====================================================

  getGraficoAtendimento():
    Observable<AtendimentoAgrupadoResponse[]> {

    return this.http.get<AtendimentoAgrupadoResponse[]>(
      `${this.url}/api/v1/atendimento/consultar-graficos-atendimento`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // GRÁFICO PROCESSO
  // =====================================================

  getGraficoProceso():
    Observable<ProcessoAgrupadoResponse[]> {

    return this.http.get<ProcessoAgrupadoResponse[]>(
      `${this.url}/api/v1/processo/consultar-graficos-processo`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // GRÁFICO CASO
  // =====================================================

  getGraficoCaso():
    Observable<CasoAgrupadoResponse[]> {

    return this.http.get<CasoAgrupadoResponse[]>(
      `${this.url}/api/v1/caso/consultar-graficos-casos`,
      {
        headers: this.getHeaders()
      }
    );
  }


  // =====================================================
  // LEMBRETES
  // =====================================================

  getLembretes(
    qtd: number = 5
  ): Observable<LembreteResponse[]> {

    return this.http.get<LembreteResponse[]>(
      `${this.url}/api/v1/lembrete/lembretes`,
      {
        params: {
          quantidade: qtd.toString()
        },
        headers: this.getHeaders()
      }
    );
  }
}