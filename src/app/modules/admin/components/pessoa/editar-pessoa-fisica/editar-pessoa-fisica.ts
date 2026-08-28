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
  HttpErrorResponse
} from '@angular/common/http';

import {
  ActivatedRoute,
  Router
} from '@angular/router';

import {
  finalize
} from 'rxjs';

import {
  PessoaService
} from '../../../../../core/services/pessoa.service';

import {
  CepService
} from '../../../../../core/services/cep.service';

import {
  AuthHelper
} from '../../../../../core/helpers/auth.helper';

import {
  EtiquetaService
} from '../../../../../core/services/etiqueta.service';

import {
  ConsultarEtiquetaResponse
} from '../../../../../core/models/etiqueta/consultar-etiqueta-response';

import {
  AutenticarUsuarioResponse
} from '../../../../../core/models/usuario/autenticar-usuario.response';

import {
  PerfilEnum
} from '../../../../../core/models/enums/perfil/perfilEnum';

import {
  TratamentoEnum
} from '../../../../../core/models/enums/tratamento/tratamentoEnum';

import {
  EstadoCivilEnum
} from '../../../../../core/models/enums/estado-civil/EstadoCivilEnum';

import {
  ESTADOS_BRASIL
} from '../../../../../core/models/estados/estados-brasil';

import {
  EnderecoRequest
} from '../../../../../core/models/endereco/endereco-request';

import {
  InformacoesComplementaresRequest
} from '../../../../../core/models/informacoes-complementares/informacoes-complementares-request';

import {
  ContaBancariaRequest
} from '../../../../../core/models/conta-bancaria/conta-bancaria-request';

import {
  PessoaFisicaUpdateRequest
} from '../../../../../core/models/pessoa/pessoa-fisica-update-request';

import {
  MunicipioService
} from '../../../../../core/services/municipio.service';

import {
  limparNull
} from '../../../../../core/utils/limpar-null';


@Component({
  selector: 'app-editar-pessoa-fisica',
  standalone: false,
  templateUrl: './editar-pessoa-fisica.html',
  styleUrls: ['./editar-pessoa-fisica.css']
})
export class EditarPessoaFisica
  implements OnInit {

  // =====================================================
  // SERVIÇOS
  // =====================================================

  private pessoaService =
    inject(PessoaService);

  private builder =
    inject(FormBuilder);

  private router =
    inject(Router);

  private route =
    inject(ActivatedRoute);

  private authHelper =
    inject(AuthHelper);

  private cepService =
    inject(CepService);

  private etiquetaService =
    inject(EtiquetaService);

  private municipioService =
    inject(MunicipioService);

  private cdr =
    inject(ChangeDetectorRef);


  // =====================================================
  // ESTADO
  // =====================================================

  idPessoa = '';

  usuarioLogado?:
    AutenticarUsuarioResponse | null;

  tiposEtiquetas:
    ConsultarEtiquetaResponse[] = [];

  etiquetaSelecionada?:
    ConsultarEtiquetaResponse;

  mensagemErro:
    string[] = [];

  mensagemAviso:
    string[] = [];

  mensagemSucesso:
    string[] = [];

  carregando = false;

  step = 1;

  municipios: any[] = [];

  estadosBrasil =
    ESTADOS_BRASIL;


  // =====================================================
  // PERFIL
  // =====================================================

  perfilEnum =
    PerfilEnum;

  perfis =
    Object.keys(PerfilEnum)
      .filter(
        key =>
          isNaN(Number(key))
      )
      .map(key => ({
        id:
          PerfilEnum[
            key as keyof typeof PerfilEnum
          ],

        nome:
          key
      }));


  // =====================================================
  // TRATAMENTO
  // =====================================================

  tratamentoEnum =
    TratamentoEnum;

  tratamentos =
    Object.keys(TratamentoEnum)
      .filter(
        key =>
          isNaN(Number(key))
      )
      .map(key => ({
        id:
          TratamentoEnum[
            key as keyof typeof TratamentoEnum
          ],

        nome:
          key
      }));


  // =====================================================
  // ESTADO CIVIL
  // =====================================================

  estadoCivilEnum =
    EstadoCivilEnum;

  estadosCivis =
    Object.keys(EstadoCivilEnum)
      .filter(
        key =>
          isNaN(Number(key))
      )
      .map(key => ({
        id:
          EstadoCivilEnum[
            key as keyof typeof EstadoCivilEnum
          ],

        nome:
          this.formatarEstadoCivil(
            key
          )
      }));


  // =====================================================
  // FORMULÁRIO
  // =====================================================

  form =
    this.builder.group({

      // =========================
      // DADOS BÁSICOS
      // =========================

      nome: [
        '',
        Validators.required
      ],

      apelido: [''],

      telefone: [
        '',
        Validators.required
      ],

      site: [''],

      email: [''],

      idPerfil: [
        null as number | null
      ],

      idEtiqueta: [
        null as number | null
      ],

      // =========================
      // DOCUMENTAÇÃO
      // =========================

      rg: [''],

      cpf: [
        '',
        Validators.required
      ],

      tituloEleitor: [''],

      carteiraTrabalho: [''],

      pisPasep: [''],

      cnh: [''],

      passaporte: [''],

      certidaoReservista: [''],

      // =========================
      // CONTROLE DA ALTERAÇÃO
      // =========================

      idUsuario: [''],

      observacoes: [
        '',
        Validators.required
      ],

      // =========================
      // ENDEREÇO
      // =========================

      endereco:
        this.builder.group({

          logradouro: [
            '',
            Validators.required
          ],

          numero: [
            '',
            Validators.required
          ],

          complemento: [''],

          bairro: [
            '',
            Validators.required
          ],

          localidade: [
            '',
            Validators.required
          ],

          uf: [
            '',
            Validators.required
          ],

          cep: [
            '',
            Validators.required
          ]

        }),

      // =========================
      // INFORMAÇÕES COMPLEMENTARES
      // =========================

      informacoesComplementares:
        this.builder.group({

          dataNascimento: [''],

          profissao: [''],

          estadoCivil: [
            null as number | null
          ],

          nomePai: [''],

          nomeMae: [''],

          // cidade onde nasceu
          naturalidade: [''],

          // UF de nascimento
          ufNaturalidade: [''],

          // país onde nasceu
          paisNaturalidade: [
            'Brasil'
          ],

          // Brasileira, Argentina etc.
          nacionalidade: [
            'Brasileira'
          ],

          comentario: ['']

        }),

      // =========================
      // CONTA BANCÁRIA
      // =========================

      contaBancaria:
        this.builder.group({

          tipoConta: [
            null as number | null
          ],

          nomeBanco: [''],

          agencia: [''],

          numeroConta: [''],

          pix: ['']

        })

    });


  // =====================================================
  // ON INIT
  // =====================================================

  ngOnInit(): void {

    this.mensagemErro = [];

    this.carregando = true;

    this.usuarioLogado =
      this.authHelper.get();

    if (
      this.usuarioLogado
        ?.idUsuario
    ) {

      this.form
        .get('idUsuario')
        ?.setValue(
          this.usuarioLogado
            .idUsuario
        );
    }

    const id =
      this.route
        .snapshot
        .paramMap
        .get('id');

    if (!id) {

      this.mensagemErro = [
        'Não foi possível identificar a pessoa física.'
      ];

      this.carregando = false;

      return;
    }

    this.idPessoa = id;

    this.carregarEtiquetas();

    this.carregarPessoa(
      id
    );
  }


  // =====================================================
  // CARREGAR PESSOA
  // =====================================================

  private carregarPessoa(
    id: string
  ): void {

    this.pessoaService
      .consultarPessoaFisicaPorId(
        id
      )
      .subscribe({

        next: response => {

          const pessoa =
            response.data;

          if (!pessoa) {

            this.mensagemErro = [
              'Pessoa física não encontrada.'
            ];

            this.carregando = false;

            return;
          }

          const info =
            pessoa
              .informacoesComplementares;

          const nacionalidade =
            info?.nacionalidade ??
            'Brasileira';

          const paisNaturalidade =
            info?.paisNaturalidade ??
            (
              nacionalidade ===
              'Brasileira'
                ? 'Brasil'
                : ''
            );

          // =========================
          // PREENCHER FORMULÁRIO
          // =========================

          this.form.patchValue({

            // =========================
            // DADOS BÁSICOS
            // =========================

            nome:
              pessoa.nome ?? '',

            apelido:
              pessoa.apelido ?? '',

            telefone:
              this.formatarTelefonesEmLinha(
                pessoa.telefone ?? ''
              ),

            site:
              pessoa.site ?? '',

            email:
              pessoa.email ?? '',

            idPerfil:
              pessoa.idPerfil ?? null,

            idEtiqueta:
              pessoa.idEtiqueta ?? null,

            // =========================
            // DOCUMENTAÇÃO
            // =========================

            rg:
              pessoa.rg ?? '',

            cpf:
              pessoa.cpf ?? '',

            tituloEleitor:
              pessoa.tituloEleitor ?? '',

            carteiraTrabalho:
              pessoa.carteiraTrabalho ?? '',

            pisPasep:
              pessoa.pisPasep ?? '',

            cnh:
              pessoa.cnh ?? '',

            passaporte:
              pessoa.passaporte ?? '',

            certidaoReservista:
              pessoa.certidaoReservista ?? '',

            // =========================
            // ENDEREÇO
            // =========================

            endereco: {

              logradouro:
                pessoa.endereco
                  ?.logradouro ?? '',

              numero:
                pessoa.endereco
                  ?.numero ?? '',

              complemento:
                pessoa.endereco
                  ?.complemento ?? '',

              bairro:
                pessoa.endereco
                  ?.bairro ?? '',

              localidade:
                pessoa.endereco
                  ?.localidade ?? '',

              uf:
                pessoa.endereco
                  ?.uf ?? '',

              cep:
                pessoa.endereco
                  ?.cep ?? ''

            },

            // =========================
            // INFORMAÇÕES COMPLEMENTARES
            // =========================

            informacoesComplementares: {

              dataNascimento:
                info
                  ?.dataNascimento ?? '',

              profissao:
                info
                  ?.profissao ?? '',

              estadoCivil:
                info
                  ?.estadoCivil ?? null,

              nomePai:
                info
                  ?.nomePai ?? '',

              nomeMae:
                info
                  ?.nomeMae ?? '',

              naturalidade:
                info
                  ?.naturalidade ?? '',

              ufNaturalidade:
                info
                  ?.ufNaturalidade ?? '',

              paisNaturalidade:
                paisNaturalidade,

              nacionalidade:
                nacionalidade,

              comentario:
                info
                  ?.comentario ?? ''

            },

            // =========================
            // CONTA BANCÁRIA
            // =========================

            contaBancaria: {

              tipoConta:
                pessoa
                  .contaBancaria
                  ?.tipoConta ?? null,

              nomeBanco:
                pessoa
                  .contaBancaria
                  ?.nomeBanco ?? '',

              agencia:
                pessoa
                  .contaBancaria
                  ?.agencia ?? '',

              numeroConta:
                pessoa
                  .contaBancaria
                  ?.numeroConta ?? '',

              pix:
                pessoa
                  .contaBancaria
                  ?.pix ?? ''

            }

          });

          // =========================
          // MUNICÍPIOS DO BRASIL
          // =========================

          if (
            nacionalidade ===
              'Brasileira' &&
            info?.ufNaturalidade
          ) {

            this
              .carregarMunicipiosNaturalidade(
                info.ufNaturalidade,
                info.naturalidade ?? ''
              );
          }
          else {

            this.municipios = [];
          }

          this.carregando = false;

          this.cdr.detectChanges();
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
  // CARREGAR ETIQUETAS
  // =====================================================

  private carregarEtiquetas(): void {

    this.etiquetaService
      .consultar()
      .subscribe({

        next: response => {

          this.tiposEtiquetas =
            response;
        },

        error: () => {

          this.mensagemAviso = [
            'Não foi possível carregar as etiquetas.'
          ];
        }

      });
  }


  // =====================================================
  // STEP
  // =====================================================

  irParaStep(
    step: number
  ): void {

    this.step = step;
  }


  // =====================================================
  // NATURALIDADE BRASILEIRA
  // =====================================================

  get naturalidadeBrasileira():
    boolean {

    return (
      this.form
        .get(
          'informacoesComplementares.nacionalidade'
        )
        ?.value ===
      'Brasileira'
    );
  }


  // =====================================================
  // ALTERAR NACIONALIDADE
  // =====================================================

  onNacionalidadeChange():
    void {

    const info =
      this.form.get(
        'informacoesComplementares'
      );

    const nacionalidade =
      info
        ?.get('nacionalidade')
        ?.value;

    // =========================
    // BRASILEIRO
    // =========================

    if (
      nacionalidade ===
      'Brasileira'
    ) {

      info
        ?.get(
          'paisNaturalidade'
        )
        ?.setValue(
          'Brasil'
        );

      return;
    }

    // =========================
    // ESTRANGEIRO
    // =========================

    info
      ?.get(
        'ufNaturalidade'
      )
      ?.setValue('');

    info
      ?.get(
        'naturalidade'
      )
      ?.setValue('');

    if (
      info
        ?.get(
          'paisNaturalidade'
        )
        ?.value ===
      'Brasil'
    ) {

      info
        ?.get(
          'paisNaturalidade'
        )
        ?.setValue('');
    }

    this.municipios = [];
  }


  // =====================================================
  // ALTERAR UF NATURALIDADE
  // =====================================================

  onUfNaturalidadeChange():
    void {

    const uf =
      this.form
        .get(
          'informacoesComplementares.ufNaturalidade'
        )
        ?.value;

    this.form
      .get(
        'informacoesComplementares.naturalidade'
      )
      ?.setValue('');

    this.municipios = [];

    if (!uf) {
      return;
    }

    this
      .carregarMunicipiosNaturalidade(
        uf
      );
  }


  // =====================================================
  // CARREGAR MUNICÍPIOS
  // =====================================================

  private carregarMunicipiosNaturalidade(
    uf: string,
    naturalidade?: string
  ): void {

    if (!uf) {

      this.municipios = [];

      return;
    }

    this.municipioService
      .buscarPorUf(
        uf
      )
      .subscribe({

        next: municipios => {

          this.municipios =
            municipios.sort(
              (
                a,
                b
              ) =>
                a.nome.localeCompare(
                  b.nome
                )
            );

          // =========================
          // EDIÇÃO
          // =========================

          if (naturalidade) {

            this.form
              .get(
                'informacoesComplementares.naturalidade'
              )
              ?.setValue(
                naturalidade
              );
          }

          this.cdr.detectChanges();
        },

        error: () => {

          this.mensagemAviso = [
            'Não foi possível carregar os municípios.'
          ];
        }

      });
  }


  // =====================================================
  // SUBMIT
  // =====================================================

  onSubmit(): void {

    this.mensagemErro = [];

    this.mensagemAviso = [];

    this.mensagemSucesso = [];

    // =========================
    // VALIDAR FORM
    // =========================

    if (this.form.invalid) {

      this.form
        .markAllAsTouched();

      this.mensagemErro = [
        'Preencha corretamente os campos obrigatórios.'
      ];

      return;
    }

    // =========================
    // VALIDAR ID
    // =========================

    if (!this.idPessoa) {

      this.mensagemErro = [
        'Não foi possível identificar a pessoa física.'
      ];

      return;
    }

    this.carregando = true;

    // =========================
    // DADOS DO FORM
    // =========================

    const formValue =
      this.form.getRawValue();

    // =========================
    // ENDEREÇO
    // =========================

    const endereco =
      limparNull<EnderecoRequest>(
        formValue.endereco ??
        {}
      );

    // =========================
    // INFORMAÇÕES COMPLEMENTARES
    // =========================

    const informacoesComplementares =
      limparNull<
        InformacoesComplementaresRequest
      >(
        formValue
          .informacoesComplementares ??
        {}
      );

    // =========================
    // CONTA BANCÁRIA
    // =========================

    const contaBancaria =
      limparNull<
        ContaBancariaRequest
      >(
        formValue
          .contaBancaria ??
        {}
      );

    // =========================
    // REQUEST
    // =========================

    const request:
      PessoaFisicaUpdateRequest = {

      nome:
        formValue.nome
          ?.trim() ||
        undefined,

      apelido:
        formValue.apelido
          ?.trim() ||
        undefined,

      idEtiqueta:
        formValue
          .idEtiqueta != null
          ? Number(
              formValue.idEtiqueta
            )
          : undefined,

      email:
        formValue.email
          ?.trim() ||
        undefined,

      site:
        formValue.site
          ?.trim() ||
        undefined,

      idPerfil:
        formValue
          .idPerfil != null
          ? Number(
              formValue.idPerfil
            )
          : undefined,

      rg:
        formValue.rg
          ?.trim() ||
        undefined,

      cpf:
        formValue.cpf
          ?.trim() ||
        undefined,

      tituloEleitor:
        formValue
          .tituloEleitor
          ?.trim() ||
        undefined,

      carteiraTrabalho:
        formValue
          .carteiraTrabalho
          ?.trim() ||
        undefined,

      pisPasep:
        formValue
          .pisPasep
          ?.trim() ||
        undefined,

      cnh:
        formValue.cnh
          ?.trim() ||
        undefined,

      passaporte:
        formValue
          .passaporte
          ?.trim() ||
        undefined,

      certidaoReservista:
        formValue
          .certidaoReservista
          ?.trim() ||
        undefined,

      telefone:
        formValue
          .telefone
          ?.trim() ||
        undefined,

      idUsuario:
        this.usuarioLogado
          ?.idUsuario ??
        undefined,

      idSexo:
        undefined,

      observacoes:
        formValue
          .observacoes
          ?.trim() ||
        undefined,

      endereco,

      informacoesComplementares,

      contaBancaria
    };

    // =========================
    // ENVIAR
    // =========================

    this.pessoaService
      .editarPessoaFisica(
        this.idPessoa,
        request
      )
      .pipe(

        finalize(() => {

          this.carregando = false;

          this.cdr
            .detectChanges();
        })

      )
      .subscribe({

        next: response => {

          this.mensagemErro = [];

          this.mensagemAviso = [];

          this.mensagemSucesso = [
            response.message
          ];

          this.cdr
            .detectChanges();

          setTimeout(
            () => {

              this.router.navigate([
                '/admin/consultar-pessoas'
              ]);

            },
            3000
          );
        },

        error: (
          err:
            HttpErrorResponse
        ) => {

          this.tratarErro(
            err
          );
        }

      });
  }


  // =====================================================
  // BUSCAR CEP
  // =====================================================

  buscarCep(): void {

    this.mensagemErro = [];

    this.mensagemAviso = [];

    const cep =
      this.form
        .get(
          'endereco.cep'
        )
        ?.value
        ?.replace(
          /\D/g,
          ''
        );

    if (
      !cep ||
      cep.length !== 8
    ) {

      this.mensagemAviso = [
        'O CEP deve conter 8 dígitos.'
      ];

      return;
    }

    this.cepService
      .buscarCep(
        cep
      )
      .subscribe({

        next: endereco => {

          if (
            (endereco as any)
              .erro
          ) {

            this.mensagemErro = [
              'CEP não encontrado.'
            ];

            return;
          }

          this.form.patchValue({

            endereco: {

              logradouro:
                endereco.logradouro,

              bairro:
                endereco.bairro,

              localidade:
                endereco.localidade,

              uf:
                endereco.uf

            }

          });
        },

        error: () => {

          this.mensagemErro = [
            'Erro ao buscar o CEP.'
          ];
        }

      });
  }


  // =====================================================
  // UF
  // =====================================================

  limitarUf(
    valor: string
  ): string {

    if (!valor) {
      return '';
    }

    return valor
      .replace(
        /[^a-zA-Z]/g,
        ''
      )
      .toUpperCase()
      .substring(
        0,
        2
      );
  }


  onBlurUf(): void {

    const controle =
      this.form
        .get(
          'endereco.uf'
        );

    const valor =
      controle
        ?.value ||
      '';

    controle?.setValue(
      this.limitarUf(
        valor
      )
    );
  }


  // =====================================================
  // FORMATAÇÃO TELEFONE
  // =====================================================

  formatarTelefonesEmLinha(
    valor?: string
  ): string {

    if (!valor) {
      return '';
    }

    return valor
      .split(';')
      .map(
        telefone => {

          const numeros =
            telefone.replace(
              /\D/g,
              ''
            );

          if (
            numeros.length ===
            11
          ) {

            return numeros.replace(
              /(\d{2})(\d{5})(\d{4})/,
              '($1) $2-$3'
            );
          }

          if (
            numeros.length ===
            10
          ) {

            return numeros.replace(
              /(\d{2})(\d{4})(\d{4})/,
              '($1) $2-$3'
            );
          }

          return telefone
            .trim();
        }
      )
      .join('; ');
  }


  formatarLimitarTelefones():
    void {

    const controle =
      this.form
        .get('telefone');

    if (
      !controle?.value
    ) {
      return;
    }

    const formatado =
      this
        .limitarTelefonesMaximo33Numeros(
          controle.value
        );

    controle.setValue(
      formatado
    );
  }


  limitarTelefonesMaximo33Numeros(
    valor: string
  ): string {

    const apenasNumeros =
      valor
        .replace(
          /\D/g,
          ''
        )
        .substring(
          0,
          33
        );

    const telefones:
      string[] = [];

    for (
      let inicio = 0;
      inicio <
      apenasNumeros.length;
      inicio += 11
    ) {

      const telefone =
        apenasNumeros
          .substring(
            inicio,
            inicio + 11
          );

      if (
        telefone.length ===
        11
      ) {

        telefones.push(

          telefone.replace(
            /(\d{2})(\d{5})(\d{4})/,
            '($1) $2-$3'
          )

        );
      }
      else if (
        telefone.length ===
        10
      ) {

        telefones.push(

          telefone.replace(
            /(\d{2})(\d{4})(\d{4})/,
            '($1) $2-$3'
          )

        );
      }
    }

    return telefones
      .join('; ');
  }


  // =====================================================
  // FORMATAÇÃO EMAIL
  // =====================================================

  formatarCampoEmail():
    void {

    const controle =
      this.form
        .get('email');

    const valor =
      controle?.value;

    if (!valor) {
      return;
    }

    let emails =
      valor
        .split(';')
        .map(
          email =>
            email.trim()
        )
        .filter(
          email =>
            email
        );

    if (
      emails.length >
      3
    ) {

      this.mensagemErro = [
        'Você só pode informar no máximo três e-mails.'
      ];

      emails =
        emails.slice(
          0,
          3
        );
    }

    controle.setValue(
      emails.join('; ')
    );
  }


  // =====================================================
  // FORMATAR ESTADO CIVIL
  // =====================================================

  private formatarEstadoCivil(
    valor: string
  ): string {

    switch (
      valor
    ) {

      case 'Solteiro':
        return 'Solteiro(a)';

      case 'Casado':
        return 'Casado(a)';

      case 'Divorciado':
        return 'Divorciado(a)';

      case 'Viuvo':
        return 'Viúvo(a)';

      case 'Separado':
        return 'Separado(a)';

      case 'UniaoEstavel':
        return 'União Estável';

      default:
        return valor;
    }
  }


  // =====================================================
  // PODE ENVIAR
  // =====================================================

  get podeEnviar():
    boolean {

    return (
      this.form.valid &&
      !this.carregando
    );
  }


  // =====================================================
  // TRATAR ERRO
  // =====================================================

  private tratarErro(
    err: HttpErrorResponse
  ): void {

    this.mensagemErro = [];

    const errorResponse =
      err.error;

    // =========================
    // ERRORS
    // =========================

    if (
      errorResponse
        ?.errors
    ) {

      for (
        const key in
        errorResponse.errors
      ) {

        const erros =
          errorResponse
            .errors[key];

        if (
          Array.isArray(
            erros
          )
        ) {

          erros.forEach(
            item => {

              if (
                typeof item ===
                'string'
              ) {

                this
                  .mensagemErro
                  .push(
                    item
                  );
              }
              else if (
                item
                  ?.errorMessage
              ) {

                this
                  .mensagemErro
                  .push(
                    item
                      .errorMessage
                  );
              }
              else if (
                item
                  ?.message
              ) {

                this
                  .mensagemErro
                  .push(
                    item
                      .message
                  );
              }
              else {

                this
                  .mensagemErro
                  .push(
                    JSON.stringify(
                      item
                    )
                  );
              }

            }
          );
        }
      }
    }

    // =========================
    // MESSAGE
    // =========================

    else if (
      errorResponse
        ?.message
    ) {

      this.mensagemErro.push(
        errorResponse.message
      );
    }

    // =========================
    // MENSAGEM
    // =========================

    else if (
      errorResponse
        ?.mensagem
    ) {

      this.mensagemErro.push(
        errorResponse.mensagem
      );
    }

    // =========================
    // STRING
    // =========================

    else if (
      typeof errorResponse ===
      'string'
    ) {

      this.mensagemErro.push(
        errorResponse
      );
    }

    // =========================
    // FALLBACK
    // =========================

    else {

      this.mensagemErro.push(
        'Erro inesperado ao atualizar a pessoa física.'
      );
    }

    this.carregando = false;

    this.cdr.detectChanges();
  }
}