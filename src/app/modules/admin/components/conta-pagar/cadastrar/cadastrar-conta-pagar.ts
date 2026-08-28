import {
  ChangeDetectorRef,
  Component,
  inject,
  NgZone,
  OnInit
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  catchError,
  finalize,
  of
} from 'rxjs';

import {
  PessoaService
} from '../../../../../core/services/pessoa.service';

import {
  CategoriaFinanceiraService
} from '../../../../../core/services/categoria-financeira.service';

import {
  CentroCustoService
} from '../../../../../core/services/centro-custo.service';

import {
  ContaPagarService
} from '../../../../../core/services/conta-paga.service';

import {
  PessoaResumo
} from '../../../../../core/models/pessoa/pessoa-resumo';

import {
  CategoriaFinanceiraResponse
} from '../../../../../core/models/categoria-financeira/categoria-financeira-response';

import {
  CentroCustoResponse
} from '../../../../../core/models/centro-custo/centro-custo-response';

import {
  ContaPagarRequest
} from '../../../../../core/models/contas/conta-pagar-request';
import { FormaRecebimento } from '../../../../../core/models/enums/conta/forma-recebimentoEnum';
import { ContratoService } from '../../../../../core/services/contrato.service';
import { ContratoResponse } from '../../../../../core/models/contrato/contrato-response';


@Component({
  selector: 'app-cadastrar-conta-pagar',
  templateUrl: './cadastrar-conta-pagar.html',
  standalone: false,
  styleUrl: './cadastrar-conta-pagar.css'
})
export class CadastrarContaPagar
  implements OnInit {

  private builder =
    inject(FormBuilder);

  private service =
    inject(ContaPagarService);

  private pessoaService =
    inject(PessoaService);

  private categoriaFinanceiraService =
    inject(CategoriaFinanceiraService);

  private centroCustoService =
    inject(CentroCustoService);

  private zone =
    inject(NgZone);

  private cdr =
    inject(ChangeDetectorRef);
private contratoService =
  inject(ContratoService);

contratos:
  ContratoResponse[] = [];

  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  fornecedoresFiltrados:
    PessoaResumo[] = [];

  fornecedorSelecionado?:
    PessoaResumo;


  categorias:
    CategoriaFinanceiraResponse[] = [];

  centrosCusto:
    CentroCustoResponse[] = [];

formaRecebimentoEnum =
  FormaRecebimento;
  form = this.builder.group({

    descricao: [
      '',
      Validators.required
    ],

    valor: [
      0,
      [
        Validators.required,
        Validators.min(0.01)
      ]
    ],

    dataVencimento: [
      '',
      Validators.required
    ],

    categoriaFinanceiraId: [
      null as string | null
    ],

    centroCustoId: [
      null as string | null
    ],

    contratoId: [
      null as string | null
    ],

  formaRecebimento: [
    FormaRecebimento.Pix,
    Validators.required
  ],

    parcelado: [
      false
    ],

    quantidadeParcelas:
      this.builder.control<number | null>(
        null
      )

  });


  // =====================================================
  // INIT
  // =====================================================
carregarContratos(): void {

  this.contratoService
    .consultarContratosDisponiveisContaPagar()
    .pipe(
      catchError(
        () => of([])
      )
    )
    .subscribe(
      res => {

        this.contratos =
          res;

        this.cdr.detectChanges();

      }
    );
}
  ngOnInit(): void {

    this.carregarCategorias();

    this.carregarCentrosCusto();
  this.carregarContratos();
    this.form
      .get('parcelado')
      ?.valueChanges
      .subscribe(
        parcelado => {

          if (parcelado) {

            this.form.patchValue({
              quantidadeParcelas: 2
            });

          } else {

            this.form.patchValue({
              quantidadeParcelas: null
            });

          }

        }
      );
  }


  // =====================================================
  // VALIDAÇÃO
  // =====================================================

get podeEnviar(): boolean {

  const parcelado =
    this.form
      .get('parcelado')
      ?.value;

  const parcelas =
    this.form
      .get('quantidadeParcelas')
      ?.value;

  if (
    parcelado &&
    (
      !parcelas ||
      parcelas <= 1
    )
  ) {
    return false;
  }

  return (
    this.form.valid &&
    !!this.fornecedorSelecionado?.id &&
    !this.carregando
  );
}


  // =====================================================
  // MOEDA
  // =====================================================

  onMoneyInput(
    event: any
  ): void {

    let value =
      event.target.value
        .replace(
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

      event.target.value =
        '0,00';

      return;
    }

    const numericValue =
      Number(value);

    const valor =
      numericValue / 100;

    this.form
      .get('valor')
      ?.setValue(
        valor,
        {
          emitEvent: false
        }
      );

    event.target.value =
      valor.toLocaleString(
        'pt-BR',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      );
  }


  // =====================================================
  // FORNECEDOR
  // =====================================================

  buscarFornecedores(
    nome: string
  ): void {

    this.pessoaService
      .consultarPessoasResumo(
        nome
      )
      .pipe(
        catchError(
          () => of([])
        )
      )
      .subscribe(
        res => {

          this.fornecedoresFiltrados =
            res;

          this.cdr.detectChanges();
        }
      );
  }


  // =====================================================
  // CATEGORIAS FINANCEIRAS
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
        res => {

          /*
           * Conta a Pagar aceita
           * somente categorias do tipo:
           *
           * 2 = Despesa
           */
          this.categorias =
            res.filter(
              categoria =>
                categoria.tipo === 2
            );

          this.cdr.detectChanges();
        }
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
        res => {

          /*
           * Se CentroCustoResponse possuir
           * a propriedade ativo, mostramos
           * somente os ativos.
           */

          this.centrosCusto =
            res.filter(
              centro =>
                centro.ativo
            );

          this.cdr.detectChanges();
        }
      );
  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];


    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;
    }


    if (
      !this.fornecedorSelecionado
    ) {

      this.mensagemErro = [
        'Selecione um fornecedor.'
      ];

      return;
    }


    const valor =
      Number(
        this.form.value.valor
      );


    if (
      valor <= 0
    ) {

      this.mensagemErro = [
        'O valor deve ser maior que zero.'
      ];

      return;
    }


    this.zone.run(() => {

      this.carregando =
        true;

      this.cdr.detectChanges();

    });


    const request:
      ContaPagarRequest = {

      descricao:
        this.form
          .value
          .descricao!
          .trim(),

      valor:
        valor,

      dataVencimento:
        new Date(
          this.form
            .value
            .dataVencimento!
        ),

      pessoaId:
        this.fornecedorSelecionado.id,

      categoriaFinanceiraId:
        this.form
          .value
          .categoriaFinanceiraId ||
        undefined,

      centroCustoId:
        this.form
          .value
          .centroCustoId ||
        undefined,

      contratoId:
        this.form
          .value
          .contratoId ||
        undefined,

          formaRecebimento:
    this.form.value.formaRecebimento!,

      parcelado:
        this.form
          .value
          .parcelado ??
        false,

      quantidadeParcelas:
        this.form
          .value
          .parcelado
          ? Number(
              this.form
                .value
                .quantidadeParcelas
            )
          : undefined

    };


    this.service
      .cadastrarContaPagar(
        request
      )
      .pipe(

        finalize(() => {

          this.zone.run(() => {

            this.carregando =
              false;

            this.cdr.detectChanges();

          });

        })

      )
      .subscribe({

        next: (
          response
        ) => {

          this.zone.run(() => {

            this.resetar();

            this.mensagemSucesso = [

              response.message ??
              'Conta a pagar cadastrada com sucesso.'

            ];

            this.cdr.detectChanges();

          });

        },


        error: (
          err: HttpErrorResponse
        ) => {

          this.tratarErro(
            err
          );

        }

      });

  }


  // =====================================================
  // TRATAR ERRO
  // =====================================================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.zone.run(() => {

      this.mensagemErro = [];

      this.mensagemSucesso = [];

      const e =
        err?.error;


      if (
        e?.errors
      ) {

        for (
          const key in e.errors
        ) {

          this.mensagemErro.push(
            ...e.errors[key]
          );

        }

      } else if (
        e?.mensagem
      ) {

        this.mensagemErro.push(
          e.mensagem
        );

      } else if (
        e?.message
      ) {

        this.mensagemErro.push(
          e.message
        );

      } else if (
        typeof e === 'string'
      ) {

        this.mensagemErro.push(
          e
        );

      } else {

        this.mensagemErro.push(
          'Erro ao cadastrar conta a pagar.'
        );

      }


      this.carregando =
        false;

      this.cdr.detectChanges();

    });

  }


  // =====================================================
  // RESET
  // =====================================================

  private resetar(): void {

    this.form.reset({

      descricao:
        '',

      valor:
        0,

      dataVencimento:
        '',

      categoriaFinanceiraId:
        null,

      centroCustoId:
        null,

      contratoId:
        null,

      parcelado:
        false,

      quantidadeParcelas:
        null,
        formaRecebimento:
  FormaRecebimento.Pix,

    });

    this.fornecedorSelecionado =
      undefined;

    this.fornecedoresFiltrados =
      [];
  }


  // =====================================================
  // SIMULAÇÃO PARCELAS
  // =====================================================

  get simulacaoParcelas() {

    const valor =
      Number(
        this.form
          .get('valor')
          ?.value ??
        0
      );

    const qtd =
      Number(
        this.form
          .get('quantidadeParcelas')
          ?.value ??
        1
      );

    const data =
      this.form
        .get('dataVencimento')
        ?.value;


    if (
      !data ||
      qtd <= 0
    ) {

      return [];
    }


    const valorParcela =
      Number(
        (
          valor /
          qtd
        ).toFixed(2)
      );


    const parcelas = [];


    for (
      let i = 0;
      i < qtd;
      i++
    ) {

      const venc =
        new Date(data);

      venc.setMonth(
        venc.getMonth() +
        i
      );

      parcelas.push({

        numero:
          i + 1,

        valor:
          valorParcela,

        vencimento:
          venc

      });

    }


    return parcelas;
  }


  get valorParcela(): string {

    const valor =
      Number(
        this.form
          .get('valor')
          ?.value ??
        0
      );

    const qtd =
      Number(
        this.form
          .get('quantidadeParcelas')
          ?.value ??
        1
      );

    const result =
      qtd > 0
        ? valor / qtd
        : valor;

    return result.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  }
}