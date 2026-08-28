import {
  ChangeDetectorRef,
  Component,
  OnInit,
  inject
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import { ContaReceberService } from '../../../../../core/services/conta-receber.service';
import { FormaRecebimento } from '../../../../../core/models/enums/conta/forma-recebimentoEnum';
import { BaixaFinanceiraRequest } from '../../../../../core/models/baixa/baixa-financeira-request';
import { ContaReceberBaixaRequest } from '../../../../../core/models/contas/conta-receber-baixa-request';

@Component({
  selector: 'app-visualizar-conta-receber',
  standalone: false,
  templateUrl: './visualizar-conta-receber.html',
  styleUrl: './visualizar-conta-receber.css'
})
export class VisualizarContaReceber implements OnInit {

  conta: any = null;
  contaSelecionadaId: string = '';
  carregando = false;

  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];
  mostrarModalBaixa = false;
  pagamentoSelecionado: any = null;

mostrarModalPagamento = false;
     // tela
salvandoBaixa = false;     // modal
  formaRecebimentoEnum = FormaRecebimento;
  private route = inject(ActivatedRoute);
  private contaService = inject(ContaReceberService);
  private cdr = inject(ChangeDetectorRef);

  formatarContrato(numero?: string): string {

    if (!numero) {
      return '';
    }

    if (numero.length === 9) {
      return `CTR: ${numero.substring(0, 5)}-${numero.substring(5)}`;
    }

    return `CTR: ${numero}`;
  }

  ngOnInit(): void {

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.mensagemErro = [
        'Identificador da conta não informado.'
      ];

      return;
    }

    this.carregarConta(id);
  }

  get saldo(): number {
    return (this.conta?.valor ?? 0)
      - (this.conta?.valorPago ?? 0);
  }
  carregarConta(id: string): void {

    this.carregando = true;

    this.contaService
      .obterContaReceberPorId(id)
      .subscribe({
        next: (response) => {

          this.conta = response;

          this.carregando = false;

          this.cdr.detectChanges();
        },
        error: (error) => {

          console.error(error);

          this.mensagemErro = [
            'Não foi possível carregar a conta.'
          ];

          this.carregando = false;

          this.cdr.detectChanges();
        }
      });
  }

  getFormaRecebimento(forma: number): string {

    switch (forma) {

      case FormaRecebimento.Dinheiro:
        return 'Dinheiro';

      case FormaRecebimento.Pix:
        return 'PIX';

      case FormaRecebimento.CartaoCredito:
        return 'Cartão de Crédito';

      case FormaRecebimento.CartaoDebito:
        return 'Cartão de Débito';

      case FormaRecebimento.Transferencia:
        return 'Transferência';

      case FormaRecebimento.Boleto:
        return 'Boleto';

      default:
        return 'Não informado';
    }
  }

  getFormaRecebimentoIcon(
    tipo: FormaRecebimento
  ): string {

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





  baixa: ContaReceberBaixaRequest = {
    valorPago: 0,
    dataBaixa: new Date(),
    formaRecebimento: FormaRecebimento.Pix,
    observacao: ''
  };
  abrirModalBaixa(
    contaId: string,
    valor: number
  ): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    this.contaSelecionadaId = contaId;

    this.baixa = {
      valorPago: valor,
      dataBaixa: new Date(),
      formaRecebimento: FormaRecebimento.Pix,
      observacao: ''
    };

    this.mostrarModalBaixa = true;
  }
  testarParcela(parcela: any): void {
    console.log('PARCELA', parcela);
  }
confirmarBaixa(): void {

  this.salvandoBaixa = true;

  this.contaService
    .baixarContaReceber(
      this.contaSelecionadaId,
      this.baixa
    )
    .subscribe({

      next: (response: any) => {

        this.mensagemSucesso = [
          response?.message ?? 'Baixa realizada com sucesso.'
        ];

        this.fecharModalBaixa();

        this.salvandoBaixa = false;

        this.carregarConta(this.conta.id);
      },

      error: (err) => {

        this.salvandoBaixa = false;

        this.tratarErro(err);
      }
    });
}
  fecharModalBaixa(): void {

    this.mostrarModalBaixa = false;

    this.baixa = {
      valorPago: 0,
      dataBaixa: new Date(),
      formaRecebimento: FormaRecebimento.Pix,
      observacao: ''
    };

    this.contaSelecionadaId = '';

    this.cdr.detectChanges();
  }
  abrirDetalhesPagamento(item: any): void {

  this.mensagemErro = [];

  if (!item) {
    this.mensagemErro = [
      'Pagamento não encontrado.'
    ];

    return;
  }

  // =========================
  // PARCELA
  // =========================

  if (item.baixas) {

    if (item.baixas.length === 0) {
      this.mensagemErro = [
        'Não foram encontrados dados do recebimento.'
      ];

      return;
    }

    this.pagamentoSelecionado =
      item.baixas[0];
  }

  // =========================
  // BAIXA DIRETA / À VISTA
  // =========================

  else {

    this.pagamentoSelecionado =
      item;
  }


  this.mostrarModalPagamento =
    true;

  this.cdr.detectChanges();
}


fecharDetalhesPagamento(): void {

  this.mostrarModalPagamento =
    false;

  this.pagamentoSelecionado =
    null;

  this.cdr.detectChanges();
}
  private tratarErro(err: any): void {

    this.mensagemErro = [];

    const e = err?.error;

    if (e?.errors) {

      for (const key in e.errors) {
        this.mensagemErro.push(...e.errors[key]);
      }

    }
    else if (e?.mensagem) {

      this.mensagemErro.push(e.mensagem);

    }
    else if (e?.message) {

      this.mensagemErro.push(e.message);

    }
    else {

      this.mensagemErro.push(
        'Erro inesperado ao realizar a baixa.'
      );
    }

    this.carregando = false;

    console.error('ERRO BACKEND:', e);

    this.cdr.detectChanges();
  }
  abrirDetalhesContaPaga(): void {

  this.mensagemErro = [];

  if (
    !this.conta?.baixas ||
    this.conta.baixas.length === 0
  ) {

    this.mensagemErro = [
      'Não foram encontrados os dados do recebimento desta conta.'
    ];

    return;
  }

  this.pagamentoSelecionado =
    this.conta.baixas[0];

  this.mostrarModalPagamento =
    true;

  this.cdr.detectChanges();
}
}