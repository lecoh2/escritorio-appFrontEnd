import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  MatTableDataSource
} from '@angular/material/table';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  CategoriaFinanceiraService
} from '../../../../../core/services/categoria-financeira.service';

import {
  CategoriaFinanceiraResponse
} from '../../../../../core/models/categoria-financeira/categoria-financeira-response';


@Component({
  selector: 'app-consultar-categoria-financeira',
  standalone: false,
  templateUrl: './consultar-categoria-financeira.html',
  styleUrl: './consultar-categoria-financeira.css'
})
export class ConsultarCategoriaFinanceira
  implements OnInit {

  displayedColumns: string[] = [
    'nome',
    'descricao',
    'tipo',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<CategoriaFinanceiraResponse>([]);

  consulta:
    CategoriaFinanceiraResponse[] = [];

  totalRegistros = 0;

  paginaAtual = 1;

  tamanhoPagina = 10;

  totalPaginas = 1;

  paginasVisiveis: number[] = [];

  carregando = false;

  filtro = '';

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  private categoriaFinanceiraService =
    inject(CategoriaFinanceiraService);

  private cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {
      console.log('ENTROU NO CONSULTAR CATEGORIA FINANCEIRA');

    this.carregarCategoriasFinanceiras();
  }


  // =====================================================
  // FILTRO
  // =====================================================

  aplicarFiltro(): void {

    this.paginaAtual = 1;

    this.carregarCategoriasFinanceiras();
  }


  // =====================================================
  // CARREGAR CATEGORIAS FINANCEIRAS
  // =====================================================

  carregarCategoriasFinanceiras(): void {
  console.log('CHAMOU carregarCategoriasFinanceiras');
    this.carregando = true;

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.categoriaFinanceiraService
      .consultarCategoriaFinanceiraPaginado(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro?.trim() || undefined
      )
      .subscribe({

        next: (
          response: any
        ) => {

          const items:
            CategoriaFinanceiraResponse[] =
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

          if (
            this.totalPaginas < 1
          ) {

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
            'Erro ao consultar categorias financeiras.'
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

    this.carregarCategoriasFinanceiras();
  }


  // =====================================================
  // ATUALIZAR PÁGINAS VISÍVEIS
  // =====================================================

  atualizarPaginasVisiveis(): void {

    const maxVisiveis =
      5;

    let inicio =
      Math.max(
        1,
        this.paginaAtual -
        Math.floor(
          maxVisiveis / 2
        )
      );

    let fim =
      Math.min(
        this.totalPaginas,
        inicio +
        maxVisiveis -
        1
      );

    inicio =
      Math.max(
        1,
        fim -
        maxVisiveis +
        1
      );

    this.paginasVisiveis =
      Array.from(
        {
          length:
            fim -
            inicio +
            1
        },

        (
          _,
          index
        ) =>
          inicio +
          index
      );
  }


  // =====================================================
  // EXIBIR TIPO
  // =====================================================

  obterTipo(
    tipo: number
  ): string {

    switch (
      tipo
    ) {

      case 1:
        return 'Receita';

      case 2:
        return 'Despesa';

      default:
        return '-';
    }
  }
}