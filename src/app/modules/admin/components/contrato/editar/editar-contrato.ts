declare var bootstrap: any;

import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  FormBuilder,
  Validators
} from '@angular/forms';

import {
  ActivatedRoute
} from '@angular/router';

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
  HistoricoService
} from '../../../../../core/services/historico.service';

import {
  PessoaResumo
} from '../../../../../core/models/pessoa/pessoa-resumo';

import {
  ProcessoAutoComplete
} from '../../../../../core/models/processo/processo-auto-complete';

import {
  TipoEntidadeEnum
} from '../../../../../core/models/enums/tipo-entidade/tipo-entidadeEnum';
import { ContratoUpdateRequest } from '../../../../../core/models/contrato/contrato-update-request';


@Component({
  selector: 'app-editar-contrato',
  standalone: false,
  templateUrl: './editar-contrato.html',
  styleUrl: './editar-contrato.css'
})
export class EditarContrato
  implements OnInit {

  @ViewChild('modalHistorico')
  modalHistorico!: ElementRef;


  // =====================================================
  // SERVICES
  // =====================================================

  private builder =
    inject(FormBuilder);

  private contratoService =
    inject(ContratoService);

  private pessoaService =
    inject(PessoaService);

  private processoService =
    inject(ProcessoService);

  private historicoService =
    inject(HistoricoService);

  private route =
    inject(ActivatedRoute);

  private cdr =
    inject(ChangeDetectorRef);

  private zone =
    inject(NgZone);


  // =====================================================
  // IDS
  // =====================================================

  contratoId!: string;


  // =====================================================
  // ESTADO
  // =====================================================

  carregando = false;

  carregandoHistorico = false;

  mensagemErro: string[] = [];

  mensagemSucesso: string[] = [];


  // =====================================================
  // CLIENTE
  // =====================================================

  clientesFiltrados:
    PessoaResumo[] = [];

  clienteSelecionado?:
    PessoaResumo;


  // =====================================================
  // PROCESSOS
  // =====================================================

  processosFiltrados:
    ProcessoAutoComplete[] = [];

  processosSelecionados:
    ProcessoAutoComplete[] = [];


  // =====================================================
  // HISTÓRICO
  // =====================================================

  historico: any[] = [];


  // =====================================================
  // FORM
  // =====================================================

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

    status: [
      1,
      Validators.required
    ],

    observacao: [
      '',
      Validators.maxLength(500)
    ]

  });


  // =====================================================
  // INIT
  // =====================================================

  ngOnInit(): void {

    this.contratoId =
      this.route.snapshot
        .paramMap
        .get('id')!;

    if (!this.contratoId) {

      this.mensagemErro = [
        'Identificador do contrato não informado.'
      ];

      return;
    }

    this.carregarContrato();
  }


  // =====================================================
  // PODE ENVIAR
  // =====================================================

  get podeEnviar(): boolean {

    return (
      this.form.valid &&
      this.clienteSelecionado != null &&
      this.processosSelecionados.length > 0 &&
      !this.carregando
    );
  }


  // =====================================================
  // CARREGAR CONTRATO
  // =====================================================

  carregarContrato(): void {

    this.mensagemErro = [];

    this.mensagemSucesso = [];

    this.zone.run(() => {

      this.carregando =
        true;

      this.cdr.detectChanges();

    });


    this.contratoService
      .obterContratoPorId(
        this.contratoId
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

            this.form.patchValue({

              numero:
                res.numero ?? '',

              dataInicio:
                res.dataInicio
                  ?.substring(
                    0,
                    10
                  ) ?? '',

              dataFim:
                res.dataFim
                  ?.substring(
                    0,
                    10
                  ) ?? '',

              status:
                res.status ?? 1,

              observacao:
                ''

            });


            // =========================
            // CLIENTE
            // =========================

            this.clienteSelecionado = {

              id:
                res.pessoaId,

              nome:
                res.nomePessoa

            } as PessoaResumo;


            // =========================
            // PROCESSOS
            // =========================

            this.processosSelecionados =
              res.processos ?? [];


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

    this.mensagemErro = [];

    this.mensagemSucesso = [];


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
      ContratoUpdateRequest = {

      id:
        this.contratoId,

      numero:
        this.form.value
          .numero!
          .trim(),

      pessoaId:
        this.clienteSelecionado.id,

      dataInicio:
        new Date(
          this.form.value
            .dataInicio!
        ),

      dataFim:
        this.form.value
          .dataFim
          ? new Date(
              this.form.value
                .dataFim
            )
          : undefined,

      status:
        Number(
          this.form.value
            .status
        ),

      processosIds:
        this.processosSelecionados
          .map(
            x => x.id
          ),

      observacao:
        this.form.value
          .observacao
          ?.trim() ||
        ''

    };


    this.contratoService
      .editarContrato(
        this.contratoId,
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

            this.mensagemSucesso = [

              res?.message ??
              'Contrato atualizado com sucesso.'

            ];


            // Limpa apenas o motivo da alteração.
            // Os demais dados continuam na tela.

            this.form.patchValue({

              observacao:
                ''

            });


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
  // HISTÓRICO
  // =====================================================

  abrirHistoricoProcesso(
    contratoId: string
  ): void {

    this.carregandoHistorico =
      true;

    this.historico =
      [];


    const modal =
      new bootstrap.Modal(
        this.modalHistorico.nativeElement
      );


    this.historicoService
      .ConsultarHistorico(
        TipoEntidadeEnum.Contrato,
        contratoId
      )
      .subscribe({

        next: (
          res
        ) => {

          this.zone.run(() => {

            this.historico =
              (res ?? [])
                .map(
                  (h: any) => ({
                    ...h,

                    antes:
                      h.dadosAntes
                        ? JSON.parse(
                            h.dadosAntes
                          )
                        : null,

                    depois:
                      h.dadosDepois
                        ? JSON.parse(
                            h.dadosDepois
                          )
                        : null
                  })
                );


            this.carregandoHistorico =
              false;

            modal.show();

            this.cdr.detectChanges();

          });

        },


        error: (
          err
        ) => {

          console.error(
            'ERRO HISTÓRICO:',
            err
          );

          this.zone.run(() => {

            this.carregandoHistorico =
              false;

            this.mensagemErro = [
              'Não foi possível carregar o histórico do contrato.'
            ];

            this.cdr.detectChanges();

          });

        }

      });
  }


  // =====================================================
  // MUDANÇAS DO HISTÓRICO
  // =====================================================

  getMudancas(
    h: any
  ): {
    campo: string;
    antes: any;
    depois: any;
  }[] {

    if (
      !h.antes ||
      !h.depois
    ) {

      return [];
    }


    const mudancas: {
      campo: string;
      antes: any;
      depois: any;
    }[] = [];


    Object
      .keys(
        h.depois
      )
      .forEach(
        key => {

          const antes =
            h.antes[key];

          const depois =
            h.depois[key];


          if (
            JSON.stringify(
              antes
            ) !==
            JSON.stringify(
              depois
            )
          ) {

            mudancas.push({

              campo:
                key,

              antes:
                antes,

              depois:
                depois

            });

          }

        }
      );


    return mudancas;
  }


  // =====================================================
  // FORMATAR CAMPO HISTÓRICO
  // =====================================================

  formatarCampo(
    campo: string
  ): string {

    const map: any = {

      Numero:
        'Número do Contrato',

      PessoaId:
        'Cliente',

      NomePessoa:
        'Nome do Cliente',

      DataInicio:
        'Data de Início',

      DataFim:
        'Data de Fim',

      Status:
        'Status',

      Objeto:
        'Objeto',

      Processos:
        'Processos Vinculados'

    };


    return (
      map[campo] ??
      campo
    );
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
          'Erro inesperado ao atualizar contrato.'
        );

      }


      this.carregando =
        false;

      this.cdr.detectChanges();


      console.error(
        'ERRO EDITAR CONTRATO:',
        e
      );

    });
  }
}