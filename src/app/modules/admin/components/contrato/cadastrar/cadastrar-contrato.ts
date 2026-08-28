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
  ContratoService
} from '../../../../../core/services/contrato.service';

import {
  PessoaService
} from '../../../../../core/services/pessoa.service';

import {
  ProcessoService
} from '../../../../../core/services/processo.service';

import {
  PessoaResumo
} from '../../../../../core/models/pessoa/pessoa-resumo';

import {
  ContratoRequest
} from '../../../../../core/models/contrato/contrato-request';

import {
  ProcessoAutoComplete
} from '../../../../../core/models/processo/processo-auto-complete';


@Component({
  selector: 'app-cadastrar-contrato',
  standalone: false,
  templateUrl: './cadastrar-contrato.html',
  styleUrl: './cadastrar-contrato.css'
})
export class CadastrarContrato
  implements OnInit {

  private builder =
    inject(FormBuilder);

  private contratoService =
    inject(ContratoService);

  private pessoaService =
    inject(PessoaService);

  private processoService =
    inject(ProcessoService);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  carregando = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  processosFiltrados:
    ProcessoAutoComplete[] = [];

  processosSelecionados:
    ProcessoAutoComplete[] = [];


  clientesFiltrados:
    PessoaResumo[] = [];

  clienteSelecionado?:
    PessoaResumo;


  form = this.builder.group({

    numero: [
      '',
      Validators.required
    ],

    dataInicio: [
      '',
      Validators.required
    ],

    dataFim: [
      ''
    ],

    observacao: [
      '',
      Validators.maxLength(500)
    ]

  });


  ngOnInit(): void {
  }


  // =====================================================
  // PODE ENVIAR
  // =====================================================

 get podeEnviar(): boolean {

  const formularioValido =
    this.form.valid;

  const clienteValido =
    !!this.clienteSelecionado?.id;

  const processosValidos =
    this.processosSelecionados.length > 0;

  const naoEstaCarregando =
    !this.carregando;

  return (
    formularioValido &&
    clienteValido &&
    processosValidos &&
    naoEstaCarregando
  );
}

  // =====================================================
  // CLIENTE
  // =====================================================

  buscarClientes(
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

          this.clientesFiltrados =
            res;

          this.cdr.detectChanges();

        }
      );
  }


  // =====================================================
  // PROCESSOS
  // =====================================================

  buscarProcessos(
    termo: string
  ): void {

    if (
      !termo ||
      termo.length < 2
    ) {

      this.processosFiltrados =
        [];

      return;
    }

    this.processoService
      .consultarProcessoAutoComplete(
        termo
      )
      .pipe(
        catchError(
          () => of([])
        )
      )
      .subscribe(
        res => {

          this.processosFiltrados =
            res;

          this.cdr.detectChanges();

        }
      );
  }


  selecionarProcesso(
    processo: ProcessoAutoComplete
  ): void {

    const existe =
      this.processosSelecionados
        .some(
          x =>
            x.id === processo.id
        );

    if (!existe) {

      this.processosSelecionados.push(
        processo
      );
    }

    this.processosFiltrados =
      [];

    this.cdr.detectChanges();
  }


  removerProcesso(
    processo: ProcessoAutoComplete
  ): void {

    this.processosSelecionados =
      this.processosSelecionados.filter(
        x =>
          x.id !== processo.id
      );

    this.cdr.detectChanges();
  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.mensagemErro =
      [];

    this.mensagemSucesso =
      [];


    if (
      this.form.invalid
    ) {

      this.form.markAllAsTouched();

      return;
    }


    if (
      !this.clienteSelecionado
    ) {

      this.mensagemErro = [
        'Selecione um cliente.'
      ];

      return;
    }


    if (
      this.processosSelecionados.length === 0
    ) {

      this.mensagemErro = [
        'Selecione pelo menos um processo.'
      ];

      return;
    }


    this.zone.run(() => {

      this.carregando =
        true;

      this.cdr.detectChanges();

    });


    const request:
      ContratoRequest = {

      numero:
        this.form.value.numero!.trim(),

      pessoaId:
        this.clienteSelecionado.id,

      dataInicio:
        new Date(
          this.form.value.dataInicio!
        ),

      dataFim:
        this.form.value.dataFim
          ? new Date(
              this.form.value.dataFim
            )
          : undefined,

      processosIds:
        this.processosSelecionados.map(
          x => x.id
        ),

      observacao:
        this.form.value.observacao?.trim() ||
        undefined

    };


    this.contratoService
      .cadastrarContrato(
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
          res: any
        ) => {

          this.zone.run(() => {

            this.resetar();

            this.mensagemSucesso = [

              res.message ??
              'Contrato cadastrado com sucesso.'

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

      this.mensagemErro =
        [];

      this.mensagemSucesso =
        [];

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
          'Erro inesperado ao cadastrar contrato.'
        );

      }


      this.carregando =
        false;

      this.cdr.detectChanges();

      console.error(
        'ERRO BACKEND:',
        e
      );

    });
  }


  // =====================================================
  // RESET
  // =====================================================

  private resetar(): void {

    this.form.reset({

      numero:
        '',

      dataInicio:
        '',

      dataFim:
        '',

      observacao:
        ''

    });


    this.clienteSelecionado =
      undefined;

    this.clientesFiltrados =
      [];

    this.processosFiltrados =
      [];

    this.processosSelecionados =
      [];

    this.cdr.detectChanges();
  }
  selecionarCliente(
  cliente: PessoaResumo | undefined
): void {

  this.clienteSelecionado =
    cliente;

  this.cdr.detectChanges();
}
}