import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  ActivatedRoute
} from '@angular/router';

import {
  FormaRecebimento
} from '../../../../../core/models/enums/conta/forma-recebimentoEnum';

import {
  ContaPagarService
} from '../../../../../core/services/conta-paga.service';

import {
  ContaPagarBaixaRequest
} from '../../../../../core/models/contas/conta-pagar-baixa-request';


@Component({
  selector: 'app-visualizar-conta-pagar',
  standalone: false,
  templateUrl: './visualizar-conta-pagar.html',
  styleUrl: './visualizar-conta-pagar.css'
})
export class VisualizarContaPagar
  implements OnInit {

  conta: any = null;

  contaSelecionadaId = '';

  carregando = false;

  salvandoBaixa = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  mostrarModalBaixa = false;

  formaRecebimentoEnum =
    FormaRecebimento;
pagamentoSelecionado: any = null;

mostrarModalPagamento = false;

  private route =
    inject(ActivatedRoute);

  private contaService =
    inject(ContaPagarService);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  // =====================================================
  // BAIXA
  // =====================================================

  baixa: ContaPagarBaixaRequest = {

    valorPago: 0,

    dataBaixa:
      new Date(),

    formaRecebimento:
      FormaRecebimento.Pix,

    contaBancariaEmpresaId:
      undefined,

    observacao:
      ''

  };


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    const id =
      this.route.snapshot.paramMap.get('id');

    if (!id) {

      this.mensagemErro = [
        'Identificador da conta não informado.'
      ];

      return;
    }

    this.carregarConta(id);
  }


  // =====================================================
  // SALDO
  // =====================================================

  get saldo(): number {

    return (
      (this.conta?.valor ?? 0) -
      (this.conta?.valorPago ?? 0)
    );
  }


  // =====================================================
  // CONTRATO
  // =====================================================

  formatarContrato(
    numero?: string
  ): string {

    if (!numero) {
      return '';
    }

    if (numero.length === 9) {

      return `CTR: ${numero.substring(
        0,
        5
      )}-${numero.substring(5)}`;
    }

    return `CTR: ${numero}`;
  }


  // =====================================================
  // CARREGAR CONTA
  // =====================================================

  carregarConta(
    id: string
  ): void {

    this.carregando =
      true;

    this.mensagemErro =
      [];

    this.contaService
      .obterContaPagarPorId(id)
      .subscribe({

        next: (
          response
        ) => {

          this.zone.run(() => {

            this.conta =
              response;

            this.carregando =
              false;

            this.cdr.detectChanges();

          });

        },

        error: (
          error
        ) => {

          console.error(
            error
          );

          this.zone.run(() => {

            this.mensagemErro = [
              'Não foi possível carregar a conta a pagar.'
            ];

            this.carregando =
              false;

            this.cdr.detectChanges();

          });

        }

      });
  }


  // =====================================================
  // FORMA DE PAGAMENTO
  // =====================================================
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


  getFormaRecebimentoIcon(
  tipo: FormaRecebimento
): string {

  switch (tipo) {

    case FormaRecebimento.Dinheiro:
      return 'fas fa-money-bill-wave text-success';

    case FormaRecebimento.Pix:
      return 'fas fa-qrcode text-primary';

    case FormaRecebimento.CartaoCredito:
      return 'fas fa-credit-card text-success';

    case FormaRecebimento.CartaoDebito:
      return 'fas fa-credit-card text-info';

    case FormaRecebimento.Boleto:
      return 'fas fa-barcode text-warning';

    case FormaRecebimento.Transferencia:
      return 'fas fa-exchange-alt text-secondary';

    default:
      return 'fas fa-wallet';
  }
}


  // =====================================================
  // ABRIR MODAL BAIXA
  // =====================================================

  abrirModalBaixa(
    contaId: string,
    valor: number
  ): void {

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];

    this.contaSelecionadaId =
      contaId;

    this.baixa = {

      valorPago:
        valor,

      dataBaixa:
        new Date(),

      formaRecebimento:
        FormaRecebimento.Pix,

      contaBancariaEmpresaId:
        undefined,

      observacao:
        ''

    };

    this.mostrarModalBaixa =
      true;

    this.cdr.detectChanges();
  }


  // =====================================================
  // CONFIRMAR BAIXA
  // =====================================================

  confirmarBaixa(): void {

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];

    if (
      !this.contaSelecionadaId
    ) {

      this.mensagemErro = [
        'Conta não identificada.'
      ];

      return;
    }

    if (
      this.baixa.valorPago <= 0
    ) {

      this.mensagemErro = [
        'O valor do pagamento deve ser maior que zero.'
      ];

      return;
    }

    this.salvandoBaixa =
      true;

    this.cdr.detectChanges();

    this.contaService
      .baixarContaPagar(
        this.contaSelecionadaId,
        this.baixa
      )
      .subscribe({

        next: (
          response: any
        ) => {

          this.zone.run(() => {

            this.mensagemSucesso = [

              response?.message ??
              'Baixa realizada com sucesso.'

            ];

            this.fecharModalBaixa();

            this.salvandoBaixa =
              false;

            if (
              this.conta?.id
            ) {

              this.carregarConta(
                this.conta.id
              );
            }

            this.cdr.detectChanges();

          });

        },

        error: (
          err
        ) => {

          this.salvandoBaixa =
            false;

          this.tratarErro(
            err
          );

        }

      });
  }


  // =====================================================
  // FECHAR MODAL
  // =====================================================

  fecharModalBaixa(): void {

    this.mostrarModalBaixa =
      false;

    this.baixa = {

      valorPago:
        0,

      dataBaixa:
        new Date(),

      formaRecebimento:
        FormaRecebimento.Pix,

      contaBancariaEmpresaId:
        undefined,

      observacao:
        ''

    };

    this.contaSelecionadaId =
      '';

    this.cdr.detectChanges();
  }


  // =====================================================
  // TESTE PARCELA
  // =====================================================

  testarParcela(
    parcela: any
  ): void {

    console.log(
      'PARCELA',
      parcela
    );
  }


  // =====================================================
  // ERRO
  // =====================================================

  private tratarErro(
    err: any
  ): void {

    this.zone.run(() => {

      this.mensagemErro =
        [];

      const e =
        err?.error;

      if (e?.errors) {

        for (
          const key in e.errors
        ) {

          this.mensagemErro.push(
            ...e.errors[key]
          );
        }

      } else if (e?.mensagem) {

        this.mensagemErro.push(
          e.mensagem
        );

      } else if (e?.message) {

        this.mensagemErro.push(
          e.message
        );

      } else {

        this.mensagemErro.push(
          'Erro inesperado ao realizar a baixa.'
        );

      }

      this.carregando =
        false;

      this.salvandoBaixa =
        false;

      console.error(
        'ERRO BACKEND:',
        e
      );

      this.cdr.detectChanges();

    });
  }
abrirDetalhesPagamento(item:any): void {

    this.mensagemErro = [];

    if (!item) {

        this.mensagemErro = [
            'Pagamento não encontrado.'
        ];

        return;
    }


    // parcela
    if(item.baixas)
    {
        if(item.baixas.length === 0)
        {
            this.mensagemErro = [
                'Não existem pagamentos registrados.'
            ];
            return;
        }

        this.pagamentoSelecionado =
            item.baixas[0];
    }
    else
    {
        // conta à vista
        this.pagamentoSelecionado =
            item;
    }


    this.mostrarModalPagamento = true;

    this.cdr.detectChanges();
}


fecharDetalhesPagamento(): void {

    this.mostrarModalPagamento =
        false;

    this.pagamentoSelecionado =
        null;

    this.cdr.detectChanges();
}
}