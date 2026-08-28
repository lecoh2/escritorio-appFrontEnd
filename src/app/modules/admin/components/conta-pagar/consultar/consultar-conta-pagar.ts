import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { ContaPagarService } from '../../../../../core/services/conta-paga.service';
import { FormaRecebimento } from '../../../../../core/models/enums/conta/forma-recebimentoEnum';


@Component({
  selector: 'app-consultar-conta-pagar',
  standalone: false,
  templateUrl: './consultar-conta-pagar.html',
  styleUrl: './consultar-conta-pagar.css'
})
export class ConsultarContaPagar implements OnInit {

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

  private contaService = inject(ContaPagarService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
descricaoSelecionada = '';
  ngOnInit(): void {
    this.carregarContas();
  }

  visualizar(id: string): void {
    this.router.navigate([
      '/admin/visualizar-conta-pagar',
      id
    ]);
  }

  editar(id: string): void {
    this.router.navigate([
      '/admin/editar-conta-pagar',
      id
    ]);
  }

  aplicarFiltro() {
    this.paginaAtual = 1;
    this.carregarContas();
  }

  carregarContas() {

    this.carregando = true;
    this.mensagemErro = [];

    this.contaService
      .consultarContasPagarPaginado(
        this.paginaAtual,
        this.tamanhoPagina,
        this.filtro
      )
      .subscribe({
        next: (response: any) => {
  console.log('RESPONSE', response);
  console.log('ITEMS', response.items);
          this.consulta = response.items ?? [];
          this.totalRegistros = response.totalCount ?? 0;
          this.totalPaginas = response.totalPages ?? 1;
 console.log('CONSULTA', this.consulta);
          this.atualizarPaginasVisiveis();

          this.carregando = false;
          this.cdr.detectChanges();
        },

        error: () => {

          this.mensagemErro = [
            'Erro ao consultar contas a pagar.'
          ];

          this.carregando = false;
          this.cdr.detectChanges();
        }
      });
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
  }getFormaRecebimentoIcon(tipo: FormaRecebimento): string {
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
  }getFormaRecebimento(
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
}