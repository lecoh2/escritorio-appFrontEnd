import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import { MatTableDataSource } from '@angular/material/table';
import { HttpErrorResponse } from '@angular/common/http';

import { CentroCustoService } from '../../../../../core/services/centro-custo.service';
import { CentroCustoResponse } from '../../../../../core/models/centro-custo/centro-custo-response';

@Component({
  selector: 'app-consultar-centro-custo',
  standalone: false,
  templateUrl: './consultar-centro-custo.html',
  styleUrl: './consultar-centro-custo.css'
})
export class ConsultarCentroCusto implements OnInit {

  displayedColumns: string[] = [
    'nome',
    'descricao',
    'ativo',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<CentroCustoResponse>([]);

  consulta: CentroCustoResponse[] = [];

  totalRegistros = 0;

  paginaAtual = 1;

  tamanhoPagina = 10;

  totalPaginas = 1;

  paginasVisiveis: number[] = [];

  carregando = false;

  filtro = '';

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  private centroCustoService =
    inject(CentroCustoService);

  private cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.carregarCentroCustos();
  }


  // =====================================================
  // FILTRO
  // =====================================================

  aplicarFiltro(): void {

    this.paginaAtual = 1;

    this.carregarCentroCustos();
  }


  // =====================================================
  // CARREGAR CENTROS DE CUSTO
  // =====================================================

  carregarCentroCustos(): void {

    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.centroCustoService
      .consultarCentroCustoPaginado(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro?.trim() || undefined
      )
      .subscribe({

        next: (response: any) => {

          const items: CentroCustoResponse[] =
            response.items ?? [];

          this.consulta =
            items;

          this.dataSource.data =
            items;

          this.totalRegistros =
            response.totalCount ?? 0;

          this.totalPaginas =
            response.totalPages ??
            Math.ceil(
              this.totalRegistros /
              this.tamanhoPagina
            );

          if (this.totalPaginas < 1) {
            this.totalPaginas = 1;
          }

          this.atualizarPaginasVisiveis();

          this.carregando = false;

          this.cdr.detectChanges();
        },

        error: (
          err: HttpErrorResponse
        ) => {

          this.mensagemErro = [
            err.error?.mensagem ??
            err.error?.message ??
            'Erro ao consultar centros de custo.'
          ];

          this.consulta = [];

          this.dataSource.data = [];

          this.totalRegistros = 0;

          this.totalPaginas = 1;

          this.paginasVisiveis = [];

          this.carregando = false;

          this.cdr.detectChanges();
        }

      });
  }


  // =====================================================
  // IR PARA PÁGINA
  // =====================================================

  irParaPagina(
    pagina: number
  ): void {

    if (
      pagina < 1 ||
      pagina > this.totalPaginas ||
      pagina === this.paginaAtual
    ) {
      return;
    }

    this.paginaAtual =
      pagina;

    this.carregarCentroCustos();
  }


  // =====================================================
  // ATUALIZAR PÁGINAS VISÍVEIS
  // =====================================================

  atualizarPaginasVisiveis(): void {

    const maxVisiveis = 5;

    let inicio =
      Math.max(
        1,
        this.paginaAtual -
        Math.floor(maxVisiveis / 2)
      );

    let fim =
      Math.min(
        this.totalPaginas,
        inicio + maxVisiveis - 1
      );

    inicio =
      Math.max(
        1,
        fim - maxVisiveis + 1
      );

    this.paginasVisiveis =
      Array.from(
        {
          length:
            fim - inicio + 1
        },
        (_, index) =>
          inicio + index
      );
  }
}