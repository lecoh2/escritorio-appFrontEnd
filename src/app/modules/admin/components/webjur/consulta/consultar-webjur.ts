import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import { Router } from '@angular/router';

import {
  MatTableDataSource
} from '@angular/material/table';

import {
  finalize
} from 'rxjs';

import {
  WebJurService
} from '../../../../../core/services/webjur.service';

import {
  WebJurPublicacaoList
} from '../../../../../core/models/webjur/web-jur-publicacao-list';

@Component({
  selector: 'app-consultar-webjur',
  standalone: false,
  templateUrl: './consultar-webjur.html',
  styleUrl: './consultar-webjur.css',
})
export class ConsultarWebjur implements OnInit {

  displayedColumns: string[] = [
    'codPublicacao',
    'numeroProcesso',
    'dataPublicacao',
    'varaDescricao',
    'orgaoDescricao',
    'acoes'
  ];

  dataSource =
    new MatTableDataSource<WebJurPublicacaoList>([]);

  consulta: WebJurPublicacaoList[] = [];

  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;

  paginasVisiveis: number[] = [];

  carregando = false;

  filtro = '';

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  textoModalTitulo = '';
  textoModalConteudo = '';

  mostrarModalTexto = false;

  private readonly webjurService =
    inject(WebJurService);

  private readonly router =
    inject(Router);

  private readonly cdr =
    inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarPublicacoes();
  }

  // =====================================================
  // TEXTO
  // =====================================================

  limitarTexto(
    texto?: string,
    limite: number = 35
  ): string {

    if (!texto) {
      return '-';
    }

    return texto.length > limite
      ? texto.substring(0, limite) + '...'
      : texto;
  }

  abrirTextoCompleto(
    titulo: string,
    conteudo?: string
  ): void {

    if (!conteudo) {
      return;
    }

    this.textoModalTitulo =
      titulo;

    this.textoModalConteudo =
      conteudo;

    this.mostrarModalTexto =
      true;
  }

  fecharTextoCompleto(): void {

    this.mostrarModalTexto =
      false;

    this.textoModalTitulo =
      '';

    this.textoModalConteudo =
      '';
  }

  // =====================================================
  // FILTRO
  // =====================================================

  aplicarFiltro(): void {

    this.paginaAtual =
      1;

    this.carregarPublicacoes();
  }

  // =====================================================
  // CONSULTAR
  // =====================================================

  carregarPublicacoes(): void {

    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.webjurService
      .consultarPublicacoesPaginado(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro?.trim() || undefined
      )
      .pipe(
        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();
        })
      )
      .subscribe({

        next: response => {

          const items =
            response?.items ?? [];

          this.consulta =
            items;

          this.dataSource.data =
            items;

          this.totalRegistros =
            response?.totalCount ?? 0;

          this.totalPaginas =
            Math.max(
              1,
              Math.ceil(
                this.totalRegistros /
                this.tamanhoPagina
              )
            );

          /*
           * Caso uma exclusão ou mudança de filtro
           * deixe a página atual acima do total.
           */
          if (
            this.paginaAtual >
            this.totalPaginas
          ) {
            this.paginaAtual =
              this.totalPaginas;
          }

          this.atualizarPaginasVisiveis();
        },

        error: err => {

          this.consulta =
            [];

          this.dataSource.data =
            [];

          this.totalRegistros =
            0;

          this.totalPaginas =
            1;

          this.paginasVisiveis =
            [];

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao consultar publicações WebJur.'
          ];
        }
      });
  }

  // =====================================================
  // PAGINAÇÃO
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

    this.carregarPublicacoes();
  }

  atualizarPaginasVisiveis(): void {

    if (this.totalPaginas <= 0) {

      this.paginasVisiveis =
        [];

      return;
    }

    const maxVisiveis =
      5;

    let inicio =
      Math.max(
        1,
        this.paginaAtual - 2
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

  // =====================================================
  // IMPORTAR PUBLICAÇÕES
  // =====================================================

  importarPublicacoes(): void {

    if (this.carregando) {
      return;
    }

    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];

    this.webjurService
      .importarPublicacoes()
      .subscribe({

        next: res => {

          this.mensagemSucesso = [
            res?.message ??
            'Importação concluída com sucesso.'
          ];

          this.carregarPublicacoes();
        },

        error: err => {

          this.carregando =
            false;

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao importar publicações WebJur.'
          ];

          this.cdr.detectChanges();
        }
      });
  }

  // =====================================================
  // SINCRONIZAÇÃO COMPLETA
  // =====================================================

  sincronizarTudo(): void {

    if (this.carregando) {
      return;
    }

    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];

    this.webjurService
      .sincronizarTudo()
      .subscribe({

        next: res => {

          this.mensagemSucesso = [
            res?.message ??
            'Sincronização concluída com sucesso.'
          ];

          this.carregarPublicacoes();
        },

        error: err => {

          this.carregando =
            false;

          this.mensagemErro = [
            err?.error?.message ??
            err?.error?.mensagem ??
            'Erro ao sincronizar WebJur.'
          ];

          this.cdr.detectChanges();
        }
      });
  }
}