import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import { Chart } from 'chart.js/auto';

import {
  DashboardFinanceiroService
} from '../../../../core/services/dashboard-financeiro.service';

import {
  DashboardFinanceiroResponse
} from '../../../../core/models/dashborad-financeiro/dashboard-financeiro-response';

import {
  ConfiguracaoFinanceiraService
} from '../../../../core/services/configuracao-financeira.service';


@Component({
  selector: 'app-dashboard-financeiro',
  standalone: false,
  templateUrl: './dashboard-financeiro.html',
  styleUrls: ['./dashboard-financeiro.css']
})
export class DashboardFinanceiro
  implements OnInit {

  // =====================================================
  // SERVICES
  // =====================================================

  private dashboardService =
    inject(DashboardFinanceiroService);

  private configService =
    inject(ConfiguracaoFinanceiraService);

  private cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // DASHBOARD
  // =====================================================

  dashboard:
    DashboardFinanceiroResponse | null =
    null;


  loading =
    false;


  // =====================================================
  // META
  // =====================================================

  metaSugerida:
    number =
    0;

  metaManual:
    number =
    0;

  metaAutomatica:
    boolean =
    true;


  // =====================================================
  // PERÍODO
  // =====================================================

  anoAtual =
    new Date().getFullYear();

  mesAtual =
    new Date().getMonth() + 1;


  anos:
    number[] =
    [];


  meses = [
    {
      id: 1,
      nome: 'Janeiro'
    },
    {
      id: 2,
      nome: 'Fevereiro'
    },
    {
      id: 3,
      nome: 'Março'
    },
    {
      id: 4,
      nome: 'Abril'
    },
    {
      id: 5,
      nome: 'Maio'
    },
    {
      id: 6,
      nome: 'Junho'
    },
    {
      id: 7,
      nome: 'Julho'
    },
    {
      id: 8,
      nome: 'Agosto'
    },
    {
      id: 9,
      nome: 'Setembro'
    },
    {
      id: 10,
      nome: 'Outubro'
    },
    {
      id: 11,
      nome: 'Novembro'
    },
    {
      id: 12,
      nome: 'Dezembro'
    }
  ];


  // =====================================================
  // GRÁFICOS
  // =====================================================

  private fluxoChart?:
    Chart;

  private categoriasChart?:
    Chart;

  private fluxoPrevistoRealizadoChart?:
    Chart;

  private fluxoProjetadoChart?:
    Chart;


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const anoAtual =
      new Date().getFullYear();


    for (
      let i = anoAtual - 5;
      i <= anoAtual + 1;
      i++
    ) {
      this.anos.push(i);
    }


    this.carregarDashboard();
  }


  // =====================================================
  // CARREGAR DASHBOARD
  // =====================================================

  private carregarDashboard(): void {

    this.loading =
      true;


    this.dashboardService
      .getDashboardFinanceiro(
        this.anoAtual,
        this.mesAtual
      )
      .subscribe({

        next: (res) => {

          this.dashboard =
            res;


          this.loading =
            false;


          /*
           * Atualiza primeiro o HTML
           * para garantir que os canvas
           * estejam disponíveis.
           */
          this.cdr.detectChanges();


          setTimeout(() => {

            this.buildGraficos();

          }, 0);

        },


        error: (err) => {

          console.error(
            'Erro ao carregar dashboard financeiro',
            err
          );


          this.loading =
            false;


          this.dashboard =
            null;


          this.destruirGraficos();


          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // PESQUISAR
  // =====================================================

  pesquisar(): void {

    this.carregarDashboard();
  }


  // =====================================================
  // CONSTRUIR GRÁFICOS
  // =====================================================

  private buildGraficos(): void {

    if (!this.dashboard) {
      return;
    }


    this.buildFluxoCaixaChart();

    this.buildCategoriasChart();

    this.buildFluxoPrevistoRealizadoChart();

    this.buildFluxoProjetadoChart();
  }


  // =====================================================
  // RECEITAS X DESPESAS
  // =====================================================

  private buildFluxoCaixaChart(): void {

    const fluxo =
      this.dashboard?.receitaDespesa ?? [];


    const labels =
      fluxo.map(
        x => x.mes
      );


    const receitas =
      fluxo.map(
        x => x.receitas
      );


    const despesas =
      fluxo.map(
        x => x.despesas
      );


    const canvas =
      document.getElementById(
        'fluxoCaixaChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.fluxoChart?.destroy();


    this.fluxoChart =
      new Chart(
        canvas,
        {
          type: 'bar',

          data: {
            labels,

            datasets: [
              {
                label:
                  'Receitas',

                data:
                  receitas,

                backgroundColor:
                  '#198754'
              },

              {
                label:
                  'Despesas',

                data:
                  despesas,

                backgroundColor:
                  '#dc3545'
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {
              tooltip: {
                callbacks: {
                  label: (
                    ctx: any
                  ) => {

                    const valor =
                      Number(
                        ctx.raw ?? 0
                      );

                    return `${
                      ctx.dataset.label
                    }: R$ ${
                      this.formatarMoeda(
                        valor
                      )
                    }`;
                  }
                }
              }
            },

            scales: {
              y: {
                beginAtZero:
                  true,

                ticks: {
                  callback: (
                    value: any
                  ) =>
                    'R$ ' +
                    Number(value)
                      .toLocaleString(
                        'pt-BR'
                      )
                }
              }
            }
          }
        }
      );
  }


  // =====================================================
  // DESPESAS POR CATEGORIA
  // =====================================================

  private buildCategoriasChart(): void {

    const categorias =
      this.dashboard?.categorias ?? [];


    const labels =
      categorias.map(
        x => x.categoria
      );


    const values =
      categorias.map(
        x => x.valor
      );


    const canvas =
      document.getElementById(
        'categoriasChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.categoriasChart?.destroy();


    this.categoriasChart =
      new Chart(
        canvas,
        {
          type:
            'doughnut',

          data: {
            labels,

            datasets: [
              {
                data:
                  values
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {
              tooltip: {
                callbacks: {
                  label: (
                    ctx: any
                  ) => {

                    const valor =
                      Number(
                        ctx.raw ?? 0
                      );

                    return `${
                      ctx.label
                    }: R$ ${
                      this.formatarMoeda(
                        valor
                      )
                    }`;
                  }
                }
              }
            }
          }
        }
      );
  }


  // =====================================================
  // PREVISTO X REALIZADO
  // =====================================================

  private buildFluxoPrevistoRealizadoChart():
    void {

    const fluxo =
      this.dashboard
        ?.fluxoPrevistoRealizado ??
      [];


    const labels =
      fluxo.map(
        x => x.mes
      );


    const previsto =
      fluxo.map(
        x => x.previsto
      );


    const realizado =
      fluxo.map(
        x => x.realizado
      );


    const canvas =
      document.getElementById(
        'fluxoPrevistoRealizadoChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.fluxoPrevistoRealizadoChart
      ?.destroy();


    this.fluxoPrevistoRealizadoChart =
      new Chart(
        canvas,
        {
          type:
            'bar',

          data: {
            labels,

            datasets: [
              {
                label:
                  'Previsto',

                data:
                  previsto
              },

              {
                label:
                  'Realizado',

                data:
                  realizado
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            plugins: {
              tooltip: {
                callbacks: {
                  label: (
                    ctx: any
                  ) => {

                    const valor =
                      Number(
                        ctx.raw ?? 0
                      );

                    return `${
                      ctx.dataset.label
                    }: R$ ${
                      this.formatarMoeda(
                        valor
                      )
                    }`;
                  }
                }
              }
            },

            scales: {
              y: {
                beginAtZero:
                  true,

                ticks: {
                  callback: (
                    value: any
                  ) =>
                    'R$ ' +
                    Number(value)
                      .toLocaleString(
                        'pt-BR'
                      )
                }
              }
            }
          }
        }
      );
  }


  // =====================================================
  // FLUXO PROJETADO 90 DIAS
  // =====================================================

  private buildFluxoProjetadoChart():
    void {

    const fluxo =
      this.dashboard
        ?.fluxoCaixaProjetado ??
      [];


    const labels =
      fluxo.map(
        x =>
          new Date(
            x.data
          ).toLocaleDateString(
            'pt-BR',
            {
              day:
                '2-digit',

              month:
                '2-digit'
            }
          )
      );


    const canvas =
      document.getElementById(
        'fluxoProjetadoChart'
      ) as HTMLCanvasElement | null;


    if (!canvas) {
      return;
    }


    this.fluxoProjetadoChart
      ?.destroy();


    this.fluxoProjetadoChart =
      new Chart(
        canvas,
        {
          type:
            'line',

          data: {
            labels,

            datasets: [
              {
                label:
                  'Saldo Acumulado',

                data:
                  fluxo.map(
                    x =>
                      x.saldoAcumulado
                  ),

                borderColor:
                  '#0d6efd',

                backgroundColor:
                  'rgba(13,110,253,0.1)',

                fill:
                  true,

                tension:
                  0.4,

                pointRadius:
                  0,

                borderWidth:
                  2
              }
            ]
          },

          options: {
            responsive:
              true,

            maintainAspectRatio:
              false,

            interaction: {
              intersect:
                false,

              mode:
                'index'
            },

            plugins: {
              tooltip: {
                callbacks: {
                  label: (
                    ctx: any
                  ) => {

                    const value =
                      Number(
                        ctx.raw ?? 0
                      );

                    return `Saldo: R$ ${
                      this.formatarMoeda(
                        value
                      )
                    }`;
                  }
                }
              }
            },

            scales: {
              y: {
                ticks: {
                  callback: (
                    value: any
                  ) =>
                    'R$ ' +
                    Number(value)
                      .toLocaleString(
                        'pt-BR'
                      )
                }
              }
            }
          }
        }
      );
  }


  // =====================================================
  // DESTRUIR GRÁFICOS
  // =====================================================

  private destruirGraficos(): void {

    this.fluxoChart?.destroy();

    this.categoriasChart?.destroy();

    this.fluxoPrevistoRealizadoChart
      ?.destroy();

    this.fluxoProjetadoChart
      ?.destroy();


    this.fluxoChart =
      undefined;

    this.categoriasChart =
      undefined;

    this.fluxoPrevistoRealizadoChart =
      undefined;

    this.fluxoProjetadoChart =
      undefined;
  }


  // =====================================================
  // SALDO
  // =====================================================

  get saldo(): number {

    return (
      this.dashboard?.saldoMes ??
      0
    );
  }


  // =====================================================
  // FORMATAÇÃO
  // =====================================================

  formatarMoeda(
    valor:
      number |
      undefined |
      null
  ): string {

    return (
      valor ?? 0
    ).toLocaleString(
      'pt-BR',
      {
        minimumFractionDigits:
          2,

        maximumFractionDigits:
          2
      }
    );
  }


  // =====================================================
  // META
  // =====================================================

  get percentualMetaBarra():
    string {

    const percentual =
      this.dashboard
        ?.percentualMeta ??
      0;


    return `${
      Math.min(
        Math.max(
          percentual,
          0
        ),
        100
      )
    }%`;
  }


  // =====================================================
  // SALVAR META
  // =====================================================

  salvarMetaManual(): void {

    if (
      this.metaManual <= 0
    ) {
      return;
    }


    this.configService
      .salvarConfiguracao({
        metaMensal:
          this.metaManual,

        metaAnual:
          0
      })
      .subscribe({

        next: () => {

          this.carregarDashboard();

        },

        error: (err) => {

          console.error(
            'Erro ao salvar meta financeira.',
            err
          );

        }

      });
  }
  get saldoPrevistoMes(): number {

  const receber =
    this.dashboard?.totalReceberMes ?? 0;

  const pagar =
    this.dashboard?.totalPagarMes ?? 0;

  return receber - pagar;
}


get percentualRealizadoReceita(): number {

  const previsto =
    this.dashboard?.totalReceberMes ?? 0;

  const recebido =
    this.dashboard?.totalRecebidoMes ?? 0;

  if (previsto <= 0) {
    return 0;
  }

  return Math.round(
    (recebido / previsto) * 100
  );
}


get percentualRealizadoDespesa(): number {

  const previsto =
    this.dashboard?.totalPagarMes ?? 0;

  const pago =
    this.dashboard?.totalPagoMes ?? 0;

  if (previsto <= 0) {
    return 0;
  }

  return Math.round(
    (pago / previsto) * 100
  );
}
}