import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { ContratoService } from '../../../../../core/services/contrato.service';

@Component({
  selector: 'app-consultar-contrato',
  standalone: false,
  templateUrl: './consultar-contrato.html',
  styleUrl: './consultar-contrato.css'
})
export class ConsultarContrato implements OnInit {

  displayedColumns: string[] = [
    'numero',
    'nomePessoa',
    'dataInicio',
    'acoes'
  ];

  dataSource = new MatTableDataSource<any>([]);
  consulta: any[] = [];

  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];

  carregando = false;
  filtro = '';

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  private contratoService = inject(ContratoService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.carregarContratos();
  }

  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarContratos();
  }

 carregarContratos(): void {

  this.carregando = true;
  this.mensagemErro = [];
  this.mensagemSucesso = [];

  this.contratoService
    .consultarContratosPaginado(
      this.paginaAtual,
      this.tamanhoPagina,
      this.filtro?.trim() || undefined
    )
    .subscribe({

      next: (response: any) => {

        const items =
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

        this.carregando =
          false;

        this.cdr.detectChanges();
      },

      error: (err: any) => {

        this.mensagemErro = [

          err?.error?.mensagem ??
          err?.error?.message ??
          'Erro ao consultar contratos.'

        ];

        this.consulta = [];
        this.dataSource.data = [];

        this.totalRegistros = 0;
        this.totalPaginas = 1;
        this.paginasVisiveis = [];

        this.carregando =
          false;

        this.cdr.detectChanges();
      }

    });
}
  editar(id: string) {
    this.router.navigate([
      '/admin/contrato/editar',
      id
    ]);
  }

  irParaPagina(p: number) {

    if (p < 1 || p > this.totalPaginas)
      return;

    this.paginaAtual = p;

    this.carregarContratos();
  }

  atualizarPaginasVisiveis() {

    const maxVisiveis = 5;

    let start = Math.max(
      1,
      this.paginaAtual - 2
    );

    let end = Math.min(
      this.totalPaginas,
      start + maxVisiveis - 1
    );

    start = Math.max(
      1,
      end - maxVisiveis + 1
    );

    this.paginasVisiveis = Array.from(
      { length: end - start + 1 },
      (_, i) => start + i
    );
  }
}