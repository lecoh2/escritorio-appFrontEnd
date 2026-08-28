import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

import { ContaReceberService } from '../../../../../core/services/conta-receber.service';
import { FormaRecebimento } from '../../../../../core/models/enums/conta/forma-recebimentoEnum';

@Component({
  selector: 'app-consultar-conta-receber',
  standalone: false,
  templateUrl: './consultar-conta-receber.html',
  styleUrl: './consultar-conta-receber.css'

})
export class ConsultarContaReceber implements OnInit {

  dataSource = new MatTableDataSource<any>([]);
  consulta: any[] = [];
descricaoSelecionada = '';
  totalRegistros = 0;
  paginaAtual = 1;
  tamanhoPagina = 10;
  totalPaginas = 1;
  paginasVisiveis: number[] = [];

  carregando = false;
  filtro = '';

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];


  private contaService = inject(ContaReceberService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
visualizar(id: string): void {

  this.router.navigate([
    '/admin/visualizar-conta-receber',
    id
  ]);

}
descricaoFormatada(desc: string): string {
  const text = desc || '';
  return text.length > 20 ? text.substring(0, 20) + '...' : text;
}
  ngOnInit(): void {
    this.carregarContas();
  }
getFormaRecebimentoIcon(tipo: FormaRecebimento): string {
  switch (tipo) {
    case FormaRecebimento.Pix:
      return 'fas fa-qrcode text-primary';

    case FormaRecebimento.CartaoCredito:
      return 'fas fa-credit-card text-success';

    case FormaRecebimento.CartaoDebito:
      return 'fas fa-credit-card text-info';

    case FormaRecebimento.Dinheiro:
      return 'fas fa-money-bill-wave text-success';

    case FormaRecebimento.Boleto:
      return 'fas fa-barcode text-warning';

    case FormaRecebimento.Transferencia:
      return 'fas fa-exchange-alt text-secondary';

    

    default:
      return 'fas fa-wallet';
  }
}
  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarContas();
  }

  carregarContas() {

  this.carregando = true;
  this.mensagemErro = [];

  this.contaService
    .consultarContasReceberPaginado(
      this.paginaAtual,
      this.tamanhoPagina,
      this.filtro
    )
    .subscribe({
      next: (response: any) => {

        this.consulta = response.items ?? [];

        this.totalRegistros = response.totalCount ?? 0;

        this.totalPaginas = response.totalPages ?? 1;

        this.atualizarPaginasVisiveis();

        this.carregando = false;

        this.cdr.detectChanges();
      },

      error: () => {

        this.mensagemErro = [
          'Erro ao consultar contas a receber.'
        ];

        this.carregando = false;

        this.cdr.detectChanges();
      }
    });
}

  editar(id: string) {
    this.router.navigate([
      '/admin/editar-conta-receber',
      id
    ]);
  }
getFormaRecebimento(
  forma: FormaRecebimento
): string {

  switch (forma) {

    case FormaRecebimento.Dinheiro:
      return 'Dinheiro';

    case FormaRecebimento.Pix:
      return 'PIX';

    case FormaRecebimento.CartaoCredito:
      return 'Cartão de Crédito';

    case FormaRecebimento.CartaoDebito:
      return 'Cartão de Débito';

    case FormaRecebimento.Boleto:
      return 'Boleto';

    case FormaRecebimento.Transferencia:
      return 'Transferência';

    default:
      return 'Não informado';
  }

}
  irParaPagina(p: number) {

    if (p < 1 || p > this.totalPaginas)
      return;

    this.paginaAtual = p;
    this.carregarContas();
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