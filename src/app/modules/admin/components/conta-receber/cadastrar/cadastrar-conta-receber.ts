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

import { ContaReceberService } from '../../../../../core/services/conta-receber.service';
import { PessoaService } from '../../../../../core/services/pessoa.service';
import { ContratoService } from '../../../../../core/services/contrato.service';
import { CentroCustoService } from '../../../../../core/services/centro-custo.service';
import { CategoriaFinanceiraService } from '../../../../../core/services/categoria-financeira.service';

import { PessoaResumo } from '../../../../../core/models/pessoa/pessoa-resumo';
import { ContratoResponse } from '../../../../../core/models/contrato/contrato-response';
import { CentroCustoResponse } from '../../../../../core/models/centro-custo/centro-custo-response';
import { CategoriaFinanceiraResponse } from '../../../../../core/models/categoria-financeira/categoria-financeira-response';
import { ContaReceberRequest } from '../../../../../core/models/contas/conta-receber-request';
import { TipoContaReceber } from '../../../../../core/models/enums/conta/tipo-conta-receberEnum';
import { FormaRecebimento } from '../../../../../core/models/enums/conta/forma-recebimentoEnum';




@Component({
  selector: 'app-cadastrar-conta-receber',
  standalone: false,
  templateUrl: './cadastrar-conta-receber.html',
  styleUrl: './cadastrar-conta-receber.css'
})
export class CadastrarContaReceber implements OnInit {

  private builder = inject(FormBuilder);

  private contaReceberService = inject(ContaReceberService);
  private pessoaService = inject(PessoaService);
  private contratoService = inject(ContratoService);
  private centroCustoService = inject(CentroCustoService);
  private categoriaFinanceiraService = inject(CategoriaFinanceiraService);

  private zone = inject(NgZone);
  private cdr = inject(ChangeDetectorRef);

  carregando = false;
FormaRecebimentoEnum = FormaRecebimento;
  mensagemErro: string[] = [];
  mensagemSucesso: string[] = [];

  clientesFiltrados: PessoaResumo[] = [];
  clienteSelecionado?: PessoaResumo;

  contratos: ContratoResponse[] = [];
  contratoSelecionado?: ContratoResponse;
  categorias: CategoriaFinanceiraResponse[] = [];
  centrosCusto: CentroCustoResponse[] = [];

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
  form = this.builder.group({

    descricao: ['', Validators.required],

    valor: [0, Validators.required],

    dataVencimento: ['', Validators.required],

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
    quantidadeParcelas: this.builder.control<number | null>(null)

  });
selecionarContrato(id: string): void {

  this.contratoSelecionado =
    this.contratos.find(
      x => x.id === id
    );

}
  ngOnInit(): void {

    this.carregarContratos();
    this.carregarCategorias();
    this.carregarCentrosCusto();

    this.form.get('parcelado')
      ?.valueChanges
      .subscribe(parcelado => {

        if (parcelado) {

          this.form.patchValue({
            quantidadeParcelas: 2
          });

        } else {

          this.form.patchValue({
            quantidadeParcelas: null
          });

        }

      });

  }

  get podeEnviar(): boolean {

    const parcelado =
      this.form.get('parcelado')?.value;

    const parcelas =
      this.form.get('quantidadeParcelas')?.value;

    if (parcelado && (!parcelas || parcelas <= 1))
      return false;

    return this.form.valid && !this.carregando;
  }

  // ===================================
  // CLIENTE
  // ===================================

  buscarClientes(nome: string) {

    this.pessoaService
      .consultarPessoasResumo(nome)
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(res => {

        this.clientesFiltrados = res;

      });

  }

  // ===================================
  // CONTRATOS
  // ===================================

carregarContratos(): void {

  this.contratoService
    .consultarContratosDisponiveisContaReceber()
    .pipe(
      catchError(() => of([]))
    )
    .subscribe(res => {

      this.contratos = res;

      this.cdr.detectChanges();
    });
}
  // ===================================
  // CATEGORIAS
  // ===================================

carregarCategorias() {

  this.categoriaFinanceiraService
    .consultarCategoriaFinanceira()
    .pipe(
      catchError(() => of([]))
    )
    .subscribe(res => {

      this.categorias =
        res.filter(
          x => x.tipo === 1
        );

    });

}

  // ===================================
  // CENTROS DE CUSTO
  // ===================================

  carregarCentrosCusto() {

    this.centroCustoService
      .consultarCentroCusto()
      .pipe(
        catchError(() => of([]))
      )
      .subscribe(res => {

        this.centrosCusto = res;

      });

  }

  // ===================================
  // SUBMIT
  // ===================================

  onSubmit(): void {

    this.mensagemErro = [];
    this.mensagemSucesso = [];

    if (this.form.invalid) {

      this.form.markAllAsTouched();
      return;

    }

    if (!this.clienteSelecionado) {

      this.mensagemErro = [
        'Selecione um cliente.'
      ];

      return;

    }

    this.zone.run(() => {

      this.carregando = true;
      this.cdr.detectChanges();

    });

    const request: ContaReceberRequest = {

      descricao:
        this.form.value.descricao?.trim() ?? '',

      valor:
        Number(this.form.value.valor),

      dataVencimento:
        new Date(this.form.value.dataVencimento!),

      pessoaId: this.clienteSelecionado.id,

      contratoId:
        this.form.value.contratoId || undefined,

      categoriaFinanceiraId:
        this.form.value.categoriaFinanceiraId || undefined,

      centroCustoId:
        this.form.value.centroCustoId || undefined,


      tipoConta:
        Number(this.form.value.tipoConta),

      formaRecebimento:
        Number(this.form.value.formaRecebimento),

      parcelado:
        this.form.value.parcelado ?? false,

      quantidadeParcelas:
        this.form.value.parcelado
          ? Number(this.form.value.quantidadeParcelas)
          : undefined
    };

    this.contaReceberService
      .cadastrarContaReceber(request)
      .pipe(
        finalize(() => {

          this.zone.run(() => {

            this.carregando = false;
            this.cdr.detectChanges();

          });

        })
      )
      .subscribe({

        next: (res: any) => {

          this.zone.run(() => {

            this.resetar();

            this.mensagemSucesso = [
              res?.message ??
              'Conta a receber cadastrada com sucesso.'
            ];

            this.cdr.detectChanges();

          });

        },

        error: (err: HttpErrorResponse) => {

          this.zone.run(() => {

            const e = err?.error;

            this.mensagemErro = [];

            if (e?.errors) {

              for (const key in e.errors) {

                this.mensagemErro.push(
                  ...e.errors[key]
                );

              }

            }
            else if (e?.message) {

              this.mensagemErro.push(
                e.message
              );

            }
            else {

              this.mensagemErro.push(
                'Erro ao cadastrar conta a receber.'
              );

            }

            this.carregando = false;

            this.cdr.detectChanges();

          });

        }

      });

  }

  // ===================================
  // MOEDA
  // ===================================

  onMoneyInput(event: any) {

    let value =
      event.target.value.replace(/\D/g, '');

    if (!value) {

      this.form
        .get('valor')
        ?.setValue(0, {
          emitEvent: false
        });

      return;

    }

    const numericValue = Number(value);

    const formatted =
      new Intl.NumberFormat(
        'en-US',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }
      ).format(numericValue / 100);

    this.form
      .get('valor')
      ?.setValue(
        numericValue / 100,
        {
          emitEvent: false
        }
      );

    event.target.value = formatted;

  }

  // ===================================
  // RESET
  // ===================================
private resetar() {

    this.form.reset({

      valor: 0,

      parcelado: false,

      quantidadeParcelas: null,

      tipoConta: TipoContaReceber.Mensalidade,

      formaRecebimento: FormaRecebimento.Pix

    });


    this.clienteSelecionado = undefined;

    this.contratoSelecionado = undefined;

    this.clientesFiltrados = [];

}
  get simulacaoParcelas() {

    const valor =
      Number(this.form.get('valor')?.value ?? 0);

    const qtd =
      Number(this.form.get('quantidadeParcelas')?.value ?? 1);

    const data =
      this.form.get('dataVencimento')?.value;

    if (!data || qtd <= 0)
      return [];

    const valorParcela =
      Number((valor / qtd).toFixed(2));

    const parcelas = [];

    for (let i = 0; i < qtd; i++) {

      const vencimento = new Date(data);

      vencimento.setMonth(
        vencimento.getMonth() + i
      );

      parcelas.push({
        numero: i + 1,
        valor: valorParcela,
        vencimento
      });
    }

    return parcelas;
  }
  get valorParcela(): string {

    const valor =
      Number(this.form.get('valor')?.value ?? 0);

    const qtd =
      Number(this.form.get('quantidadeParcelas')?.value ?? 1);

    const resultado =
      qtd > 0
        ? valor / qtd
        : valor;

    return resultado.toLocaleString(
      'pt-BR',
      {
        style: 'currency',
        currency: 'BRL'
      }
    );
  }

}