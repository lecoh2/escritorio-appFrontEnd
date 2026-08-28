import {
  ChangeDetectorRef,
  Component,
  inject,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  catchError,
  finalize,
  of
} from 'rxjs';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  ActivatedRoute
} from '@angular/router';

import { ContaReceberService } from '../../../../../core/services/conta-receber.service';
import { ContratoService } from '../../../../../core/services/contrato.service';
import { CentroCustoService } from '../../../../../core/services/centro-custo.service';
import { CategoriaFinanceiraService } from '../../../../../core/services/categoria-financeira.service';

import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { ContratoResponse } from '../../../../../core/models/contrato/contrato-response';
import { CentroCustoResponse } from '../../../../../core/models/centro-custo/centro-custo-response';
import { CategoriaFinanceiraResponse } from '../../../../../core/models/categoria-financeira/categoria-financeira-response';

import { TipoContaReceber } from '../../../../../core/models/enums/conta/tipo-conta-receberEnum';
import { FormaRecebimento } from '../../../../../core/models/enums/conta/forma-recebimentoEnum';

import { ContaReceberUpdateRequest } from '../../../../../core/models/contas/conta-receber-update-request';

@Component({
  selector: 'app-editar-conta-receber',
  standalone: false,
  templateUrl: './editar-conta-receber.html',
  styleUrl: './editar-conta-receber.css'
})
export class EditarContaReceber implements OnInit {

  private builder =
    inject(FormBuilder);

  private contaReceberService =
    inject(ContaReceberService);

  private contratoService =
    inject(ContratoService);

  private centroCustoService =
    inject(CentroCustoService);

  private categoriaFinanceiraService =
    inject(CategoriaFinanceiraService);

  private route =
    inject(ActivatedRoute);

  private cdr =
    inject(ChangeDetectorRef);


  id!: string;

  carregando = false;

  bloquearParcelamento = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];

  clienteSelecionado?: PessoaResumo;

  contratos: ContratoResponse[] = [];

  categorias: CategoriaFinanceiraResponse[] = [];

  centrosCusto: CentroCustoResponse[] = [];


  FormaRecebimentoEnum =
    FormaRecebimento;


  tiposConta = [
    {
      value: TipoContaReceber.Mensalidade,
      descricao: 'Mensalidade'
    },
    {
      value: TipoContaReceber.Honorario,
      descricao: 'Honorários'
    },
    {
      value: TipoContaReceber.Contrato,
      descricao: 'Contrato'
    },
    {
      value: TipoContaReceber.Taxa,
      descricao: 'Taxa'
    },
    {
      value: TipoContaReceber.Outro,
      descricao: 'Outro'
    }
  ];


  formasRecebimento = [
    {
      value: FormaRecebimento.Pix,
      descricao: 'PIX'
    },
    {
      value: FormaRecebimento.Boleto,
      descricao: 'Boleto'
    },
    {
      value: FormaRecebimento.CartaoCredito,
      descricao: 'Cartão de Crédito'
    },
    {
      value: FormaRecebimento.CartaoDebito,
      descricao: 'Cartão de Débito'
    },
    {
      value: FormaRecebimento.Transferencia,
      descricao: 'Transferência'
    },
    {
      value: FormaRecebimento.Dinheiro,
      descricao: 'Dinheiro'
    }
  ];


  // =====================================================
  // FORM
  // =====================================================

  form = this.builder.group({

    descricao: [
      '',
      Validators.required
    ],

    valor: [
      0,
      Validators.required
    ],

    dataVencimento: [
      '',
      Validators.required
    ],

    pessoaId: [''],

    contratoId: [null],

    categoriaFinanceiraId: [null],

    centroCustoId: [null],

    tipoConta: [
      TipoContaReceber.Contrato,
      Validators.required
    ],

    formaRecebimento: [
      FormaRecebimento.Pix,
      Validators.required
    ],

    parcelado: [false],

    quantidadeParcelas: [
      null as number | null
    ]

  });


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.id =
      this.route
        .snapshot
        .paramMap
        .get('id')!;

    this.carregarContratos();

    this.carregarCategorias();

    this.carregarCentrosCusto();

    this.carregarConta();
  }


  // =====================================================
  // CARREGAR CONTA
  // =====================================================

  carregarConta(): void {

    this.carregando = true;

    this.mensagemErro = [];

    this.contaReceberService
      .obterContaReceberPorId(
        this.id
      )
      .pipe(
        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: (response: any) => {

          // =========================
          // PREENCHE O FORM
          // =========================

          this.form.patchValue({

            descricao:
              response.descricao ?? '',

            valor:
              response.valor ?? 0,

            dataVencimento:
              response.dataVencimento
                ? response.dataVencimento
                    .toString()
                    .split('T')[0]
                : '',

            pessoaId:
              response.pessoaId ?? '',

            contratoId:
              response.contratoId ?? null,

            categoriaFinanceiraId:
              response.categoriaFinanceiraId ?? null,

            centroCustoId:
              response.centroCustoId ?? null,

            tipoConta:
              response.tipoConta ??
              TipoContaReceber.Contrato,

            formaRecebimento:
              response.formaRecebimento ??
              FormaRecebimento.Pix,

            parcelado:
              response.parcelado ?? false,

            quantidadeParcelas:
              response.quantidadeParcelas ?? null

          });


          // =========================
          // SOMENTE DESCRIÇÃO EDITÁVEL
          // =========================

          this.form
            .get('valor')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('dataVencimento')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('pessoaId')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('contratoId')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('categoriaFinanceiraId')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('centroCustoId')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('tipoConta')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('formaRecebimento')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('parcelado')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('quantidadeParcelas')
            ?.disable({
              emitEvent: false
            });

          this.form
            .get('descricao')
            ?.enable({
              emitEvent: false
            });


          // =========================
          // CLIENTE
          // =========================

          this.clienteSelecionado = {

            id:
              response.pessoaId,

            nome:
              response.cliente ?? '',

            documento:
              '',

            tipo:
              'Juridica'

          };


          // =========================
          // PARCELAMENTO
          // =========================

          this.bloquearParcelamento =
            (response.valorPago ?? 0) > 0 ||
            (response.parcelas?.length ?? 0) > 0;


          this.cdr.detectChanges();
        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.mensagemErro = [

            err.error?.mensagem ??
            err.error?.message ??
            'Erro ao carregar conta.'

          ];
        }

      });
  }


  // =====================================================
  // PODE ENVIAR
  // =====================================================

  get podeEnviar(): boolean {

    const descricaoOk =
      this.form
        .get('descricao')
        ?.valid ?? false;

    return (
      descricaoOk &&
      !this.carregando
    );
  }


  // =====================================================
  // CONTRATOS
  // =====================================================

  carregarContratos(): void {

    this.contratoService
      .consultarContratos()
      .pipe(
        catchError(
          () => of([])
        )
      )
      .subscribe(
        r => this.contratos = r
      );
  }


  // =====================================================
  // CATEGORIAS
  // =====================================================

  carregarCategorias(): void {

    this.categoriaFinanceiraService
      .consultarCategoriaFinanceira()
      .pipe(
        catchError(
          () => of([])
        )
      )
      .subscribe(
        r => this.categorias = r
      );
  }


  // =====================================================
  // CENTROS DE CUSTO
  // =====================================================

  carregarCentrosCusto(): void {

    this.centroCustoService
      .consultarCentroCusto()
      .pipe(
        catchError(
          () => of([])
        )
      )
      .subscribe(
        r => this.centrosCusto = r
      );
  }


  // =====================================================
  // MONEY INPUT
  // =====================================================

  onMoneyInput(
    event: Event
  ): void {

    const input =
      event.target as HTMLInputElement;

    let value =
      input.value.replace(
        /\D/g,
        ''
      );

    if (!value) {

      this.form
        .get('valor')
        ?.setValue(
          0,
          {
            emitEvent: false
          }
        );

      return;
    }

    const numeric =
      Number(value);

    this.form
      .get('valor')
      ?.setValue(
        numeric / 100,
        {
          emitEvent: false
        }
      );

    input.value =
      new Intl.NumberFormat(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL'
        }
      )
      .format(
        numeric / 100
      );
  }


  // =====================================================
  // VALOR DA PARCELA
  // =====================================================

  get valorParcela(): string {

    const valor =
      Number(
        this.form
          .get('valor')
          ?.value ?? 0
      );

    const qtd =
      Number(
        this.form
          .get('quantidadeParcelas')
          ?.value ?? 1
      );

    return (
      qtd > 0
        ? valor / qtd
        : valor
    )
      .toLocaleString(
        'pt-BR',
        {
          style: 'currency',
          currency: 'BRL'
        }
      );
  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];


    // =========================
    // VALIDA SOMENTE DESCRIÇÃO
    // =========================

    const descricaoControl =
      this.form.get('descricao');

    if (
      descricaoControl?.invalid
    ) {

      descricaoControl
        .markAsTouched();

      return;
    }


    this.carregando = true;


    // =========================
    // REQUEST DE UPDATE
    // =========================

    const request:
      ContaReceberUpdateRequest = {

        descricao:
          descricaoControl?.value
            ?.trim() ?? ''

      };


    this.contaReceberService
      .editarContaReceber(
        this.id,
        request
      )
      .pipe(
        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: (res: any) => {

          this.mensagemSucesso = [

            res?.message ??
            'Conta a receber atualizada com sucesso.'

          ];

        },


        error: (
          err: HttpErrorResponse
        ) => {

          const erro =
            err.error;

          if (erro?.errors) {

            const mensagens:
              string[] = [];

            for (
              const key in
              erro.errors
            ) {

              if (
                Array.isArray(
                  erro.errors[key]
                )
              ) {

                mensagens.push(
                  ...erro.errors[key]
                );
              }
            }

            this.mensagemErro =
              mensagens.length
                ? mensagens
                : [
                    'Erro ao atualizar conta.'
                  ];

            return;
          }


          this.mensagemErro = [

            erro?.mensagem ??
            erro?.message ??
            'Erro ao atualizar conta.'

          ];
        }

      });
  }


  // =====================================================
  // EXCLUIR
  // =====================================================

  excluirConta(): void {

    const confirmar =
      confirm(
        'Deseja realmente excluir esta conta?'
      );

    if (!confirmar) {
      return;
    }

    this.carregando = true;

    this.mensagemErro = [];

    this.contaReceberService
      .excluirContaReceber(
        this.id
      )
      .pipe(
        finalize(() => {

          this.carregando =
            false;

          this.cdr.detectChanges();

        })
      )
      .subscribe({

        next: () => {

          alert(
            'Conta excluída com sucesso.'
          );

          history.back();
        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.mensagemErro = [

            err.error?.mensagem ??
            err.error?.message ??
            'Erro ao excluir conta.'

          ];
        }

      });
  }
}